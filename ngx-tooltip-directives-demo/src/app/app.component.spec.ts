import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DomSanitizer } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import {
  TooltipStrDirective,
  TooltipHtmlDirective,
  TooltipTemplateDirective,
  MockTooltipStrDirective,
  MockTooltipHtmlDirective,
  MockTooltipTemplateDirective
} from "ngx-tooltip-directives";


describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AppComponent ],
      providers: [
        { provide: DomSanitizer, useValue: { bypassSecurityTrustHtml: () => {} } },
      ]
    })
      .overrideComponent(AppComponent, {
        remove: {
          imports: [
            TooltipStrDirective,
            TooltipHtmlDirective,
            TooltipTemplateDirective
          ]
        },
        add: {
          imports: [
            MockTooltipStrDirective,
            MockTooltipHtmlDirective,
            MockTooltipTemplateDirective
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

})

