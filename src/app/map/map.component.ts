import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
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

  @ViewChild('worldMap', { static: false }) worldMap!: ElementRef;

  constructor(
    private countryService: CountryService,
    @Inject(PLATFORM_ID) private platformId: any,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    // Wait for SVG to fully load before accessing its content
    setTimeout(() => {
      this.attachEventListeners();
    }, 500);
  }

  attachEventListeners() {
    const svgMap = this.worldMap.nativeElement as HTMLObjectElement;
    if (!svgMap) return;

    const tryLoad = () => {
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
      } else {
        // If SVG is not ready, retry after a short delay
        setTimeout(tryLoad, 300);
      }
    };

    svgMap.addEventListener('load', tryLoad);
    tryLoad(); // Try loading immediately in case the event doesn't fire
  }

  getCountryInfo(countryCode: string) {
    this.countryService.getCountryDetails(countryCode).subscribe((data) => {
      this.countryInfo = {
        name: data.name,
        capital: data.capital,
        region: data.region,
        incomeLevel: data.incomeLevel,
        currency: data.currency,
        language: data.language,
      };
      this.cdRef.detectChanges();
    });
  }
}
