import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MockNgxTooltipDirectivesModule } from '@ngx-tooltip-directives';
import { AngularDraggableModule } from "angular2-draggable";
import { AppComponent } from "./app.component";

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        AppComponent
      ],
      imports: [ 
        AngularDraggableModule,
        MockNgxTooltipDirectivesModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

})

