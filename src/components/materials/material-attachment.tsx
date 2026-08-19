import { Download } from '@/components/icons'

/**
 * The attached file, shown rather than linked.
 *
 * Linking it out meant a new tab, and for a PDF most browsers treat that as a
 * download — so "ver el material" became "bajá este archivo y buscalo en tu
 * carpeta de descargas". You attach a worksheet in order to look at it.
 *
 * Three cases, because a file is not one thing:
 *
 *   **A PDF** goes in an `<iframe>`, which is what every browser has a viewer
 *   for. Not `<embed>`: an iframe degrades to nothing visible rather than to a
 *   plugin prompt, and its `title` is read by a screen reader.
 *
 *   **An image the browser can draw** shows itself.
 *
 *   **HEIC** cannot be drawn — Safari aside, no browser renders it — so it gets
 *   the link. This is the case that made the check worth writing: keying off
 *   `image/` alone put a broken image icon on the page of anyone who uploaded a
 *   photo straight from an iPhone.
 *
 * The link stays underneath in every case. It is how you print the worksheet or
 * save a copy, and an iframe is not a substitute for that.
 */

/** What a browser will actually draw in an `<img>`. */
const VIEWABLE_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function MaterialAttachment({
  url,
  downloadUrl,
  fileType,
  title,
  /** Taller on the material's own page than beside a form. */
  height = 520,
}: {
  url: string
  /** Signed with `Content-Disposition: attachment`. See `getMaterialFileUrl`. */
  downloadUrl: string
  fileType: string | null
  title: string
  height?: number
}) {
  const isPdf = fileType === 'application/pdf'
  const isImage = fileType !== null && VIEWABLE_IMAGES.includes(fileType)

  return (
    <div className="space-y-2">
      {isPdf ? (
        <iframe
          src={url}
          title={`Material adjunto: ${title}`}
          className="no-print w-full rounded-xl border border-border bg-muted"
          style={{ height }}
        />
      ) : isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Material adjunto: ${title}`}
          className="w-full rounded-xl border border-border object-contain"
          style={{ maxHeight: height }}
        />
      ) : null}

      {/* Says "Descargar" because that is what it does — the URL is signed to
          arrive as an attachment. */}
      <a
        href={downloadUrl}
        className="no-print inline-flex items-center gap-2 text-[13px] font-semibold text-violet hover:underline"
      >
        <Download className="size-4" />
        Descargar el archivo
      </a>

      {!isPdf && !isImage ? (
        <p className="text-xs text-muted-foreground">
          Este formato no se previsualiza acá. Descargalo y se abre con la app de tu
          computadora.
        </p>
      ) : null}
    </div>
  )
}
