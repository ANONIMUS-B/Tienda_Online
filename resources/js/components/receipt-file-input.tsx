import { useEffect, useRef, useState } from 'react';
import { Eye, Trash2, Upload, X } from 'lucide-react';

export default function ReceiptFileInput({
    name = 'payment_receipt',
    label = 'Captura del comprobante (opcional)',
    existingPath,
    accentColor = 'purple',
    onChange,
}: {
    name?: string;
    label?: string;
    existingPath?: string | null;
    accentColor?: 'purple' | 'cyan' | 'lime';
    onChange?: (file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        existingPath
            ? existingPath.startsWith('/')
                ? existingPath
                : `/storage/${existingPath}`
            : null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!selectedFile && existingPath) {
            setPreviewUrl(
                existingPath.startsWith('/')
                    ? existingPath
                    : `/storage/${existingPath}`,
            );
        }
    }, [existingPath, selectedFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            onChange?.(file);
        }
    };

    const handleClear = () => {
        if (selectedFile && previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        onChange?.(null);
    };

    const colorConfigs = {
        purple: {
            badge: 'receipt-upload-btn bg-purple-700 hover:bg-purple-800',
            borderDashed:
                'border-purple-200 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50/80',
            borderCard: 'border-purple-200 bg-white',
            text: 'text-purple-700',
            link: 'text-purple-700 hover:text-purple-900',
            iconBg: 'bg-purple-100 text-purple-700',
        },
        cyan: {
            badge: 'bg-cyan-600 hover:bg-cyan-700 text-white',
            borderDashed:
                'border-cyan-200 hover:border-cyan-400 bg-cyan-50/50 hover:bg-cyan-50/80',
            borderCard: 'border-cyan-200 bg-white',
            text: 'text-cyan-700',
            link: 'text-cyan-600 hover:text-cyan-700',
            iconBg: 'bg-cyan-100 text-cyan-700',
        },
        lime: {
            badge: 'bg-cyan-500 hover:bg-cyan-600 text-white',
            borderDashed:
                'border-cyan-200 hover:border-cyan-400 bg-cyan-50/50 hover:bg-cyan-50/80',
            borderCard: 'border-cyan-200 bg-white',
            text: 'text-cyan-700',
            link: 'text-cyan-600 hover:text-cyan-700',
            iconBg: 'bg-cyan-100 text-cyan-700',
        },
    }[accentColor];

    return (
        <div>
            <style>{`
                .receipt-upload-btn, .receipt-upload-btn * {
                    color: #ffffff !important;
                }
            `}</style>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {label}
                </label>
            )}

            <input
                ref={inputRef}
                type="file"
                name={name}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {!previewUrl ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    className={`group cursor-pointer flex items-center justify-between rounded-xl border-2 border-dashed p-3 shadow-xs transition ${colorConfigs.borderDashed}`}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`grid size-9 place-items-center rounded-lg ${colorConfigs.iconBg}`}
                        >
                            <Upload className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">
                                Adjuntar foto del comprobante
                            </p>
                            <p className="text-[11px] text-slate-500">
                                PNG, JPG, WebP hasta 5MB
                            </p>
                        </div>
                    </div>
                    <span
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold shadow-xs transition ${colorConfigs.badge}`}
                        style={{ color: '#ffffff' }}
                    >
                        Buscar foto
                    </span>
                </div>
            ) : (
                <div
                    className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 shadow-xs ${colorConfigs.borderCard}`}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <img
                            src={previewUrl}
                            alt="Comprobante"
                            className="size-12 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-85 transition shadow-xs"
                            onClick={() => setIsModalOpen(true)}
                        />
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                                {selectedFile?.name || 'Comprobante adjunto'}
                            </p>
                            {selectedFile ? (
                                <p className="text-[11px] text-slate-500">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(
                                        2,
                                    )}{' '}
                                    MB
                                </p>
                            ) : (
                                <p className="text-[11px] font-semibold text-emerald-600">
                                    ✓ Imagen cargada
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className={`mt-0.5 flex items-center gap-1 text-[11px] font-bold hover:underline ${colorConfigs.link}`}
                            >
                                <Eye className="size-3" /> Ver comprobante
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            title="Ver comprobante"
                            className="grid size-8 place-items-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                        >
                            <Eye className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            title="Quitar imagen"
                            className="grid size-8 place-items-center rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal para ver imagen ampliada */}
            {isModalOpen && previewUrl && (
                <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <button
                        type="button"
                        className="absolute inset-0"
                        aria-label="Cerrar vista previa"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className="relative z-10 flex max-h-[90vh] max-w-3xl flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                        <div className="flex w-full items-center justify-between border-b border-slate-100 pb-3 mb-3">
                            <span className="text-xs font-bold tracking-wider text-purple-700 uppercase">
                                Vista previa del comprobante
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleClear();
                                        setIsModalOpen(false);
                                    }}
                                    className="flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 px-3 py-1 text-xs font-bold text-red-600 border border-red-200 transition"
                                >
                                    <Trash2 className="size-3.5" /> Quitar imagen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="grid size-8 place-items-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-auto max-h-[75vh] w-full flex justify-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <img
                                src={previewUrl}
                                alt="Comprobante completo"
                                className="max-h-[70vh] rounded-lg object-contain shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
