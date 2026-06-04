import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchKeywordSource = new BehaviorSubject<string>('');
  currentSearchKeyword = this.searchKeywordSource.asObservable();

  constructor() { }

  updateSearchKeyword(keyword: string) {
    this.searchKeywordSource.next(keyword);
  }
}
