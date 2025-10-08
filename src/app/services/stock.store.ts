import { Observable, timer, zip } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { ComponentStore } from '@ngrx/component-store';
import { Injectable } from '@angular/core';
import { Stock } from '../models/stock.model';
import { StockService } from './stock.service';

export interface StockState {
  topTechStocks: Stock[];
  trendingStocks: Stock[];
  userProfileStocks: Stock[];
  userStockAmounts: { [symbol: string]: number };
}

@Injectable({
  providedIn: 'root',
})
export class StockStore extends ComponentStore<StockState> {
  constructor(private stockService: StockService) {
    super({
      topTechStocks: [],
      trendingStocks: [],
      userProfileStocks: [],
      userStockAmounts: {},
    });

    this.pollStockData();
  }

  readonly topTechStocks$: Observable<Stock[]> = this.select(
    (state) => state.topTechStocks,
  );
  readonly trendingStocks$: Observable<Stock[]> = this.select(
    (state) => state.trendingStocks,
  );
  readonly userProfileStocks$: Observable<Stock[]> = this.select((state) => {
    return state.userProfileStocks.map((stock) => ({
      ...stock,
      amount: state.userStockAmounts[stock.symbol] ?? stock.amount ?? 0,
    }));
  });
  readonly userProfileStockSymbols$: Observable<Set<string>> = this.select(
    this.userProfileStocks$,
    (stocks) => new Set(stocks.map((s) => s.symbol)),
  );
  readonly allStocks$: Observable<Stock[]> = this.select(
    this.topTechStocks$,
    this.trendingStocks$,
    (topTech, trending) => [...topTech, ...trending],
  );

  readonly buyStock = this.effect<{ stock: Stock; amount: number }>(
    (payload$) =>
      payload$.pipe(
        switchMap(({ stock, amount }) =>
          this.stockService.buyStock(stock, amount).pipe(
            tap(() => {
              this.updater((state) => {
                // Update the amount in our separate tracking
                const currentAmount =
                  state.userStockAmounts[stock.symbol] ?? stock.amount ?? 0;
                const newAmount = currentAmount + amount;

                const existingIndex = state.userProfileStocks.findIndex(
                  (s) => s.symbol === stock.symbol,
                );
                let updatedUserStocks = [...state.userProfileStocks];

                if (existingIndex !== -1) {
                  updatedUserStocks[existingIndex] = {
                    ...updatedUserStocks[existingIndex],
                    amount: newAmount,
                  };
                } else {
                  updatedUserStocks = [
                    ...updatedUserStocks,
                    { ...stock, amount: newAmount },
                  ];
                }

                return {
                  ...state,
                  userProfileStocks: updatedUserStocks,
                  userStockAmounts: {
                    ...state.userStockAmounts,
                    [stock.symbol]: newAmount,
                  },
                };
              })();
            }),
          ),
        ),
      ),
  );

  readonly sellStock = this.effect<{ stock: Stock; amount: number }>(
    (payload$) =>
      payload$.pipe(
        switchMap(({ stock, amount }) =>
          this.stockService.sellStock(stock, amount).pipe(
            tap(() => {
              this.updater((state) => {
                const currentAmount =
                  state.userStockAmounts[stock.symbol] ?? stock.amount ?? 0;
                const newAmount = Math.max(0, currentAmount - amount);

                let updatedUserStocks = state.userProfileStocks.map((s) =>
                  s.symbol === stock.symbol ? { ...s, amount: newAmount } : s,
                );

                if (newAmount === 0) {
                  updatedUserStocks = updatedUserStocks.filter(
                    (s) => s.symbol !== stock.symbol,
                  );
                }

                const updatedAmounts = { ...state.userStockAmounts };
                if (newAmount === 0) {
                  delete updatedAmounts[stock.symbol];
                } else {
                  updatedAmounts[stock.symbol] = newAmount;
                }

                return {
                  ...state,
                  userProfileStocks: updatedUserStocks,
                  userStockAmounts: updatedAmounts,
                };
              })();
            }),
          ),
        ),
      ),
  );

  readonly pollStockData = this.effect<void>((trigger$) =>
    trigger$.pipe(
      switchMap(() => timer(0, 2000)), // Poll every 2 seconds
      switchMap(() =>
        zip(
          this.stockService.getTopTechStocks(),
          this.stockService.getTrendingStocks(),
          this.stockService.getUserProfileStocks(),
        ),
      ),
      tap(([topTechStocks, trendingStocks, serverUserProfileStocks]) => {
        const updatedUserStockAmounts = { ...this.get().userStockAmounts };

        serverUserProfileStocks.forEach((stock) => {
          if (stock.amount !== undefined && stock.amount !== null) {
            updatedUserStockAmounts[stock.symbol] = stock.amount;
          }
        });

        Object.keys(updatedUserStockAmounts).forEach((symbol) => {
          if (
            !serverUserProfileStocks.some((stock) => stock.symbol === symbol)
          ) {
            delete updatedUserStockAmounts[symbol];
          }
        });

        this.patchState({
          topTechStocks,
          trendingStocks,
          userProfileStocks: serverUserProfileStocks,
          userStockAmounts: updatedUserStockAmounts,
        });
      }),
    ),
  );
}
