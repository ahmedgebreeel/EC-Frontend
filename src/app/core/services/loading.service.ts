//Angular Imports
import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    //State
    private _isLoading = signal(false);
    readonly isLoading = this._isLoading.asReadonly();

    show() {
        this._isLoading.set(true);
    }

    hide() {
        this._isLoading.set(false);
    }
}
