import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCanvaReveal]',
})
export class CanvaReveal {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

    ngOnInit() {
      this.renderer.addClass(this.el.nativeElement, 'canva-reveal');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.el.nativeElement, 'active');
            // Nếu muốn hiệu ứng chỉ chạy 1 lần duy nhất:
            observer.unobserve(this.el.nativeElement);
          }
        });
      }, { 
        threshold: 0.1, // Hiện ra khi thấy 10% phần tử
        rootMargin: '0px 0px -50px 0px' // Kích hoạt sớm hơn một chút trước khi chạm đáy màn hình
      });

      observer.observe(this.el.nativeElement);
    }
}
