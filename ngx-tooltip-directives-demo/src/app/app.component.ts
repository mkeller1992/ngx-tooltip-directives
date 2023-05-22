import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  title = 'ngx-tooltip-directives';
  subTitle = 'Properties';

  tooltipHtml: string = '<div><p>This is a <strong>tooltip</strong> with HTML</p></div>';
  safeTooltipHtml!: SafeHtml;

  constructor(private sanitizer: DomSanitizer){ }

  ngOnInit(): void {
    this.safeTooltipHtml = this.sanitizer.bypassSecurityTrustHtml(this.tooltipHtml);
  }

  handleTooltipEvents(event:string){
    console.log(event);
  }
}
