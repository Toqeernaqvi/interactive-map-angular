import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root', // ✅ Ensure this is present
})
export class CountryService {
  private apiUrl = 'https://api.worldbank.org/v2/country';

  constructor(private http: HttpClient) {} // ✅ HttpClient injected

  getCountryDetails(countryCode: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${countryCode}?format=json`)
      .pipe(
        map((response: any) => {
          const countryData = response[1][0];
          return {
            name: countryData.name,
            capital: countryData.capitalCity,
            region: countryData.region.value,
            incomeLevel: countryData.incomeLevel.value,
            latitude: countryData.latitude,
            longitude: countryData.longitude,
          };
        })
    );
  }
}
