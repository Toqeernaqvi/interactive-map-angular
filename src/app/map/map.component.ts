import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CountryService } from '../services/country.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  countryInfo: any = null;
  isBrowser: boolean = false;

  @ViewChild('worldMap') worldMap!: ElementRef;

  constructor(
    private countryService: CountryService,
    @Inject(PLATFORM_ID) private platformId: any,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,  // Inject ChangeDetectorRef

  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    const svgMap = this.worldMap.nativeElement as HTMLObjectElement;
    svgMap?.addEventListener('load', () => {
      const svgDoc = svgMap.contentDocument;
      if (svgDoc) {
        const countries = svgDoc.querySelectorAll('path');
        countries.forEach((country: any) => {
          this.renderer.listen(country, 'click', () => {
            const countryCode = country.getAttribute('id');
            this.getCountryInfo(countryCode);
          });

          this.renderer.listen(country, 'mouseover', () => {
            country.style.fill = '#3498db';
          });

          this.renderer.listen(country, 'mouseout', () => {
            country.style.fill = '';
          });
        });
      }
    });
  }

  getCountryInfo(countryCode: string) {
    this.countryService.getCountryDetails(countryCode).subscribe((data) => {
      debugger
      this.countryInfo = {
        name: data.name,
        capital: data.capital,
        region: data.region,
        incomeLevel: data.incomeLevel,
        currency: data.currency,
        language: data.language,
      };
      this.cdRef.detectChanges(); // ✅ Manually trigger change detection

    });
  }
}
