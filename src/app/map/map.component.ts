import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, PLATFORM_ID, Renderer2, ViewChild,} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CountryService } from '../services/country.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

export class MapComponent implements AfterViewInit {
  countryInfo: any = null;
  zoomLevel: number = 1;
  isBrowser: boolean = false;
  @ViewChild('worldMap', { static: false }) worldMap!: ElementRef;

  constructor(
    private countryService: CountryService,
    @Inject(PLATFORM_ID) private platformId: any,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2
  ) { this.isBrowser = isPlatformBrowser(this.platformId); }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
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
            country.style.fill = '#93BFCF';
          });

          this.renderer.listen(country, 'mouseout', () => {
            country.style.fill = '';
          });
        });
      } else {
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
        latitude: data.latitude,
        longitude: data.longitude,
      };
      this.cdRef.markForCheck();
    });
  }

  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 0.2, 3);
    this.applyZoom();
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 0.2, 0.5);
    this.applyZoom();
  }

  applyZoom() {
    const svgMap = this.worldMap.nativeElement as HTMLObjectElement;
    const svgDoc = svgMap.contentDocument;
    if (svgDoc) {
      const svgElement = svgDoc.documentElement;
      svgElement.style.transform = `scale(${this.zoomLevel})`;
      svgElement.style.transformOrigin = "center center";
    }
  }
}
