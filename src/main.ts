import { MarkdownView, Plugin } from 'obsidian';

export default class YamlAutoFold extends Plugin {
  async onload() {
    console.log('Loading ' + this.manifest.name + ' v' + this.manifest.version);

    this.registerEvent(
      this.app.workspace.on('layout-change', this.foldYamlHeader.bind(this)),
    );
  }

  onunload() {}

  private isSourceView() {
    const currentView = this.app.workspace
      .getActiveViewOfType(MarkdownView)
      ?.getMode();

    return currentView === 'source';
  }

  private getMarkdownView() {
    if (this.isSourceView()) {
      const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (markdownView) {
        return markdownView;
      }
    }
    return null;
  }

  private getFrontMatterElements() {
    const frontMatter =
      this.getMarkdownView()?.containerEl.getElementsByClassName(
        'cm-hmd-frontmatter',
      );

    if (frontMatter !== undefined && frontMatter.length >= 1) {
      return frontMatter;
    }

    return [];
  }

  private hasFrontMatter() {
    return this.getFrontMatterElements().length >= 1;
  }

  private getFrontMatterChildren() {
    if (this.getMarkdownView() && this.hasFrontMatter()) {
      const elements = this.getFrontMatterElements();
      if (
        elements != null &&
        elements.length != 0 &&
        elements[0].parentElement != null
      ) {
        return Array.from(elements[0].parentElement.children);
      }
    }

    return [];
  }

  private isFrontMatterFolded() {
    let folded = false;
    this.getFrontMatterChildren().forEach((element: Element) => {
      const title = element.attributes.getNamedItem('title');
      if (title != null && title.value == 'unfold') {
        folded = true;
      }
    });
    return folded;
  }

  public async foldYamlHeader() {
    if (this.hasFrontMatter() && !this.isFrontMatterFolded()) {
      const markdownView = this.getMarkdownView();
      if (markdownView != null) {
        const editor = markdownView.editor;
        const currentLocation = editor.getCursor();
        if (editor.getLine(0) === '---') {
          editor.setCursor(0);
          editor.exec('toggleFold');
          editor.setCursor(currentLocation);
        }
      }
    }
  }
}
