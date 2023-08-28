import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  combineLatest,
  filter,
  forkJoin,
  map,
  Observable,
  Subject,
  Subscription,
  switchMap,
  debounceTime,
} from 'rxjs';
import { MockDataService } from './mock-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  searchTermByCharacters = new Subject<string>();
  charactersResults$!: Observable<any>;
  planetAndCharactersResults$!: Observable<any>;
  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.initLoadingState();
    this.initCharacterEvents();
  }

  changeCharactersInput(element: any): void {
    const inputValue: string = element.target.value;
    
    this.searchTermByCharacters.next(inputValue);
  }

  initCharacterEvents(): void {
    this.charactersResults$ = this.searchTermByCharacters.pipe(
      filter(term => term.length >= 3),
      debounceTime(100),
      switchMap(term => this.mockDataService.getCharacters(term))
    );
  }

  loadCharactersAndPlanet(): void {
  this.planetAndCharactersResults$ = forkJoin({
      chars: this.mockDataService.getCharacters(),
      planets: this.mockDataService.getPlatents()
    }).pipe(
      map(results => {
        return [...results.chars, ...results.planets];
      })
    );
  }

  initLoadingState(): void {
const loaderSub: Subscription = combineLatest([
      this.mockDataService.getCharactersLoader(),
      this.mockDataService.getPlanetLoader()
    ]).subscribe(el => {
      this.isLoading = this.areAllValuesTrue(el);
    });
    this.subscriptions.push(loaderSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(el => el.unsubscribe());
  }

  areAllValuesTrue(elements: boolean[]): boolean {
    return elements.every((el) => el);
  }
}
