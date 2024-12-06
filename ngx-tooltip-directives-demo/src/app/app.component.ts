import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TooltipHtmlDirective, TooltipStrDirective, TooltipTemplateDirective } from '@ngx-tooltip-directives';
import { AngularDraggableModule } from 'angular2-draggable';
import packageJson from '../../package.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [TooltipStrDirective, TooltipHtmlDirective, TooltipTemplateDirective, AngularDraggableModule]
})

export class AppComponent implements OnInit {

  @ViewChild('tooltipProgrammatically')
  tooltipProgrammatically!: TooltipStrDirective;

  title = 'ngx-tooltip-directives';
  subTitle = 'Properties';

  tooltipHtml: string = '<div>This is a <strong>tooltip</strong> with HTML</div>';
  safeTooltipHtml!: SafeHtml;

  context = { estimate: 10 };

  constructor(private sanitizer: DomSanitizer){ }

  ngOnInit(): void {
    console.log(`Frontend Version: v${packageJson?.version}`);

    this.safeTooltipHtml = this.sanitizer.bypassSecurityTrustHtml(this.tooltipHtml);
  }

  show() {
    this.tooltipProgrammatically.show();
  }

  hide() {
    this.tooltipProgrammatically.hide();
  }

  handleTooltipEvents(event: {type: string, position: { top: number; left: number; } | DOMRect }){
    console.log(event);
  }
}
