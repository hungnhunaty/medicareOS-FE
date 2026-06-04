import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceInstruct } from './service-instruct';

describe('ServiceInstruct', () => {
  let component: ServiceInstruct;
  let fixture: ComponentFixture<ServiceInstruct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceInstruct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceInstruct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
