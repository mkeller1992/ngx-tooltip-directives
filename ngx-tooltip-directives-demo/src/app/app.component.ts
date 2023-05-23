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

  tooltipHtml: string = '<div>This is a <strong>tooltip</strong> with HTML</div>';
  safeTooltipHtml!: SafeHtml;

  constructor(private sanitizer: DomSanitizer){ }

  ngOnInit(): void {
    this.safeTooltipHtml = this.sanitizer.bypassSecurityTrustHtml(this.tooltipHtml);
  }

  handleTooltipEvents(event:string){
    console.log(event);
  }
}
