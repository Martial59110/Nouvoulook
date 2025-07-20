import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Quill from 'quill';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rich-text-editor">
      <div #editorContainer class="editor-container">
        <div #editor class="editor-content"></div>
      </div>
    </div>
  `,
  styles: [`
    .rich-text-editor {
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      overflow: hidden;
    }
    
    .editor-container {
      min-height: 200px;
    }
    
    .editor-content {
      min-height: 200px;
    }
    
    /* Personnalisation de la barre d'outils Quill */
    ::ng-deep .ql-toolbar {
      background-color: #f8f9fa;
      border-bottom: 1px solid #ced4da;
      border-top: none;
      border-left: none;
      border-right: none;
    }
    
    ::ng-deep .ql-container {
      border: none;
      min-height: 200px;
    }
    
    ::ng-deep .ql-editor {
      min-height: 200px;
      padding: 1rem;
      line-height: 1.4;
    }
    
    ::ng-deep .ql-editor h1 {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.75rem;
      line-height: 1.2;
    }
    
    ::ng-deep .ql-editor h2 {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }
    
    ::ng-deep .ql-editor h3 {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.4rem;
      line-height: 1.3;
    }
    
    ::ng-deep .ql-editor ul, ::ng-deep .ql-editor ol {
      margin-left: 1.5rem;
      margin-bottom: 0.75rem;
      line-height: 1.4;
    }
    
    ::ng-deep .ql-editor p {
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    
    /* Styles pour les titres avec listes */
    ::ng-deep .ql-editor h1 ul, ::ng-deep .ql-editor h1 ol,
    ::ng-deep .ql-editor h2 ul, ::ng-deep .ql-editor h2 ol,
    ::ng-deep .ql-editor h3 ul, ::ng-deep .ql-editor h3 ol {
      margin-left: 1rem;
      margin-top: 0.25rem;
      margin-bottom: 0.5rem;
    }
    
    /* Styles pour les éléments de liste dans les titres */
    ::ng-deep .ql-editor h1 li, ::ng-deep .ql-editor h2 li, ::ng-deep .ql-editor h3 li {
      margin-bottom: 0.2rem;
    }
    
    ::ng-deep .ql-editor a {
      color: #0d6efd;
      text-decoration: underline;
    }
    
    ::ng-deep .ql-editor a:hover {
      color: #0a58ca;
    }
    
    /* Personnalisation des sélecteurs de couleur */
    ::ng-deep .ql-color .ql-picker-options,
    ::ng-deep .ql-background .ql-picker-options {
      background-color: white;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    
    ::ng-deep .ql-color .ql-picker-item,
    ::ng-deep .ql-background .ql-picker-item {
      border-radius: 0.25rem;
      margin: 2px;
    }
    
    ::ng-deep .ql-color .ql-picker-item:hover,
    ::ng-deep .ql-background .ql-picker-item:hover {
      border: 2px solid #0d6efd;
    }
    
    ::ng-deep .ql-color .ql-picker-label,
    ::ng-deep .ql-background .ql-picker-label {
      border-radius: 0.25rem;
    }
  `]
})
export class RichTextEditorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  
  @ViewChild('editor', { static: true }) editorElement!: ElementRef;
  
  private quill: Quill | null = null;
  
  ngOnInit() {
    this.initQuill();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && this.quill && !changes['value'].firstChange) {
      // Mettre à jour le contenu de l'éditeur quand la valeur change
      const newValue = changes['value'].currentValue;
      if (newValue !== this.quill.root.innerHTML) {
        // Convertir les spans en paragraphes UNIQUEMENT pour l'affichage dans Quill
        const quillHtml = this.convertSpansToParagraphs(newValue);
        this.quill.root.innerHTML = quillHtml;
      }
    }
  }
  
  ngOnDestroy() {
    if (this.quill) {
      this.quill = null;
    }
  }
  
  private initQuill() {
    const toolbarOptions = [
      ['bold', 'italic', 'underline'],
      [{ 'header': [1, 2, 3, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ];
    
    this.quill = new Quill(this.editorElement.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: 'Saisissez votre texte ici...',
      formats: ['bold', 'italic', 'underline', 'header', 'list', 'link', 'color', 'background']
    });
    
    // Définir le contenu initial
    if (this.value) {
      // Convertir les spans en paragraphes UNIQUEMENT pour l'affichage dans Quill
      const quillHtml = this.convertSpansToParagraphs(this.value);
      this.quill.root.innerHTML = quillHtml;
    }
    
    // Écouter les changements
    this.quill.on('text-change', () => {
      const html = this.quill?.root.innerHTML || '';
      // Émettre directement le HTML de Quill (paragraphes)
      this.valueChange.emit(html);
    });
  }
  
  private convertSpansToParagraphs(html: string): string {
    if (!html) return '';
    
    // Créer un élément temporaire pour manipuler le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remplacer les spans par des paragraphes
    const spans = tempDiv.querySelectorAll('span');
    spans.forEach((span) => {
      const paragraph = document.createElement('p');
      paragraph.innerHTML = span.innerHTML;
      paragraph.className = span.className;
      paragraph.style.cssText = span.style.cssText;
      
      // Remplacer le span par le paragraphe
      span.parentNode?.replaceChild(paragraph, span);
    });
    
    // Supprimer les <br> qui ne sont plus nécessaires
    const breaks = tempDiv.querySelectorAll('br');
    breaks.forEach(br => {
      const nextElement = br.nextElementSibling;
      if (nextElement && nextElement.tagName === 'P') {
        br.remove();
      }
    });
    
    return tempDiv.innerHTML;
  }
  
  private convertParagraphsToSpans(html: string): string {
    if (!html) return '';
    
    // Créer un élément temporaire pour manipuler le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remplacer les paragraphes par des spans avec sauts de ligne
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach((p, index) => {
      const span = document.createElement('span');
      span.innerHTML = p.innerHTML;
      span.className = p.className;
      span.style.cssText = p.style.cssText;
      
      // Ajouter un saut de ligne après chaque span (sauf le dernier)
      if (index < paragraphs.length - 1) {
        const br = document.createElement('br');
        p.parentNode?.insertBefore(br, p.nextSibling);
      }
      
      p.parentNode?.replaceChild(span, p);
    });
    
    return tempDiv.innerHTML;
  }
} 