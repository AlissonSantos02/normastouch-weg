// Pop-up secundário
const PdfPreviewPopup = ({ open }: { open: boolean }) => {
  if (!open) return null;

  return (
    <div className="absolute top-4 right-4 w-80 p-4 bg-white border border-gray-300 rounded shadow-lg z-50">
      <p className="text-sm text-gray-700">
        Esta tela pode ser fechada
      </p>
    </div>
  );
};
