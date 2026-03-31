import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideStore } from "@ngrx/store";
import { App } from "./app";

describe("App", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideStore({})],
    });
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
