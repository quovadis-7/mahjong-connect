interface ImageZoomDialogProps {
  imagePath: string
  onClose: () => void
}

export function ImageZoomDialog({ imagePath, onClose }: ImageZoomDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <img
        src={imagePath}
        alt=""
        className="relative z-10 max-w-[80vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}