import React from 'react'
import { Trash2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface DeleteConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (deleteForEveryone: boolean) => void
    isSender: boolean
}

export default function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    isSender,
}: DeleteConfirmDialogProps) {
    if (!isOpen) return null

    const dialogContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl dark:shadow-2xl max-w-sm w-full mx-4 overflow-hidden border border-gray-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="font-bold text-gray-900 dark:text-white text-lg">Delete Message</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 font-medium">
                        Choose how you want to delete this message
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                onConfirm(false)
                                onClose()
                            }}
                            className="w-full text-left px-4 py-3.5 rounded-lg border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-sm font-semibold text-gray-700 dark:text-gray-200"
                        >
                            Delete for me
                        </button>

                        {isSender && (
                            <button
                                onClick={() => {
                                    onConfirm(true)
                                    onClose()
                                }}
                                className="w-full text-left px-4 py-3.5 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm font-semibold text-red-700 dark:text-red-400"
                            >
                                Delete for everyone
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all text-sm font-semibold text-gray-700 dark:text-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )

    return createPortal(dialogContent, document.body)
}
