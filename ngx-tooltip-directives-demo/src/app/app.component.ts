import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TooltipStrDirective } from 'ngx-tooltip-directives';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  @ViewChild('tooltipProgrammatically')
  tooltipProgrammatically!: TooltipStrDirective;

  title = 'ngx-tooltip-directives';
  subTitle = 'Properties';

  tooltipHtml: string = '<div>This is a <strong>tooltip</strong> with HTML</div>';
  safeTooltipHtml!: SafeHtml;

  constructor(private sanitizer: DomSanitizer){ }

  ngOnInit(): void {
    this.safeTooltipHtml = this.sanitizer.bypassSecurityTrustHtml(this.tooltipHtml);
  }

  show() {
    this.tooltipProgrammatically.show();
  }

  hide() {
    this.tooltipProgrammatically.hide();
  }

  handleTooltipEvents(event:string){
    console.log(event);
  }
}
