import { Progress } from "@/components/ui/progress"

interface Props {
  progress: number
  onCancel: () => void
}

export default function FileUploadProgress({ progress, onCancel }: Props) {
  return (
    <div className="space-y-2 w-[300px]">
      <div className="flex flex-col items-center justify-between text-sm gap-2">
        <span className="text-xon-text-secondary">
          {progress < 100 ? "Uploading file..." : "Upload complete!"}
        </span>
        <span className="font-medium">{progress}%</span>
              <Progress value={progress} className="w-full" />
                      <span>Processing...</span>

        <div className="w-full flex justify-end pt-2">
          <button
            onClick={onCancel}
            className="text-sm text-xon-text-red hover:underline"
          >
            Cancel
          </button>
        </div>




      </div>


      
    </div>
  )
}
