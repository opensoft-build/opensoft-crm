import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { DocumentViewer } from '@/activities/files/components/DocumentViewer';

jest.mock('@cyntler/react-doc-viewer', () => ({
  __esModule: true,
  default: () => <div>react-doc-viewer</div>,
  DocViewerRenderers: [],
}));

const mockFetch = (text: string) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      text: () => Promise.resolve(text),
    } as unknown as Response),
  );
};

const renderDocumentViewer = (documentName: string) =>
  render(
    <I18nProvider i18n={i18n}>
      <DocumentViewer
        documentName={documentName}
        documentUrl={`https://example.com/${documentName}`}
      />
    </I18nProvider>,
  );

describe('DocumentViewer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows text file markup as plain text without rendering it', async () => {
    const payload =
      '<img src=x onerror="window.xss = true"><script>window.xss = true</script>';
    mockFetch(payload);

    const { container } = renderDocumentViewer('notes.txt');

    expect(await screen.findByText(payload)).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(screen.queryByText('react-doc-viewer')).not.toBeInTheDocument();
  });

  it('still hands other previewable files to the document viewer', () => {
    renderDocumentViewer('report.pdf');

    expect(screen.getByText('react-doc-viewer')).toBeInTheDocument();
  });
});
