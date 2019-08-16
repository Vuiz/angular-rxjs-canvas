import {
  Component, Input, ElementRef, AfterViewInit, ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators'

@Component({
  selector: 'app-canvas',
  template: '<button (click)="change()">Change colour</button><button (click)="pushSaved()">Push saved</button><button (click)="clear()">Clear canvas</button><canvas #canvas></canvas>',
  styles: ['canvas { border: 1px solid #000; }']
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild('canvas') public canvas: ElementRef;

  @Input() public width = 400;
  @Input() public height = 400;
  saved = [];

  private cx: CanvasRenderingContext2D;

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;

    this.cx.lineWidth = 3;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';

    this.captureEvents(canvasEl);
  }

  change() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx.strokeStyle = '#15c848';
    this.captureEvents(canvasEl);

  }

  clear() {
    this.cx.clearRect(0,0, this.height, this.width);
    /*this.saved.forEach(points => {
      console.log(points);
      this.cx.clearRect(points['prevPos'], points['currentPos'], this.height, this.width);
      //this.drawOnCanvas(points['prevPos'], points['currentPos'])
    });*/
  }

  pushSaved() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx.strokeStyle = '#c61594';
    console.log(this.saved);
    this.saved.forEach(points => {
      this.drawOnCanvas(points['prevPos'], points['currentPos'])
    });

  }
  
  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event    
              takeUntil(fromEvent(canvasEl, 'mouseup')),
              // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
              takeUntil(fromEvent(canvasEl, 'mouseleave')),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point    
              pairwise()
            )
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();
  
        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };
  
        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };
  
        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos);
        this.saved.push({prevPos: prevPos, currentPos: currentPos});
        this.cx.save();
      });
  }
  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }) {
    if (!this.cx) { return; }

    this.cx.beginPath();

    if (prevPos) {
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      this.cx.lineTo(currentPos.x, currentPos.y);
      this.cx.stroke();
    }
  }

}
