import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Folder, File, Sparkles, FolderTree } from "lucide-react";
import toast from "react-hot-toast";

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  onDirectoryStructure?: (structure: DirectoryStructure) => void;
}

export interface DirectoryStructure {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: DirectoryStructure[];
  file?: File;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  onDirectoryStructure,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processEntries = async (
    entries: any[],
  ): Promise<DirectoryStructure[]> => {
    const result: DirectoryStructure[] = [];

    for (const entry of entries) {
      if (entry.isFile) {
        const file = await new Promise<File>((resolve) => {
          entry.file((file: File) => {
            resolve(file);
          });
        });

        result.push({
          name: entry.name,
          path: entry.fullPath,
          type: "file",
          file: file,
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const newEntries = await new Promise<any[]>((resolve) => {
          dirReader.readEntries((entries: any[]) => {
            resolve(entries);
          });
        });

        const children = await processEntries(newEntries);
        result.push({
          name: entry.name,
          path: entry.fullPath,
          type: "directory",
          children: children,
        });
      }
    }

    return result;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections, event) => {
      setIsProcessing(true);
      try {
        const dataTransferItems = event.dataTransfer?.items;
        let directoryStructure: DirectoryStructure[] = [];
        const uploadedFiles: File[] = [];

        if (dataTransferItems && dataTransferItems.length > 0) {
          const entries: any[] = [];

          for (let i = 0; i < dataTransferItems.length; i++) {
            const item = dataTransferItems[i];
            if (item.webkitGetAsEntry) {
              const entry = item.webkitGetAsEntry();
              if (entry) {
                entries.push(entry);
              }
            }
          }

          directoryStructure = await processEntries(entries);

          const flattenFiles = (structure: DirectoryStructure[]): File[] => {
            let files: File[] = [];

            for (const item of structure) {
              if (item.type === "file" && item.file) {
                files.push(item.file);
              } else if (item.type === "directory" && item.children) {
                files = [...files, ...flattenFiles(item.children)];
              }
            }

            return files;
          };

          uploadedFiles.push(...flattenFiles(directoryStructure));
        } else {
          uploadedFiles.push(...acceptedFiles);
          directoryStructure = acceptedFiles.map((file) => ({
            name: file.name,
            path: "/" + file.name,
            type: "file",
            file: file,
          }));
        }

        toast.success(
          `Uploaded ${uploadedFiles.length} files from directory structure successfully!`,
          {
            style: {
              background: "#FFFDF2",
              color: "#000000",
              borderRadius: "1rem",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            },
            iconTheme: {
              primary: "#000000",
              secondary: "#FFFDF2",
            },
          },
        );

        onFilesUploaded(uploadedFiles);
        onDirectoryStructure?.(
          directoryStructure.length === 1
            ? directoryStructure[0]
            : {
                name: "root",
                path: "/",
                type: "directory",
                children: directoryStructure,
              },
        );
      } catch (error) {
        console.error("Error processing directory structure:", error);
        toast.error("Failed to process directory structure");
      } finally {
        setIsProcessing(false);
      }
    },
    [onFilesUploaded, onDirectoryStructure],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="bg-[#FFFDF2] rounded-3xl shadow-xl p-8 border-2 border-black"
    >
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <FolderTree className="text-black" size={28} />
        </motion.div>
        <h2 className="text-3xl font-bold text-black">
          Upload Directory Structure
        </h2>
      </motion.div>

      <motion.div
        {...getRootProps()}
        className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${
          isDragActive
            ? "border-black bg-black/5"
            : "border-black hover:border-black"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} directory="" webkitdirectory="" />

        <motion.div
          className="relative z-10"
          animate={{
            scale: isDragActive ? 1.1 : 1,
            rotate: isDragActive ? [0, -10, 10, 0] : 0,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <div className="relative">
            <FolderTree
              className={`mx-auto mb-6 transition-all duration-300 ${
                isDragActive
                  ? "text-black scale-110"
                  : "text-black group-hover:text-black"
              }`}
              size={64}
            />
          </div>

          <h3
            className={`text-xl font-semibold mb-2 transition-colors ${
              isDragActive ? "text-black" : "text-black"
            }`}
          >
            {isDragActive
              ? "Drop your folders here!"
              : "Drop folders here or click to upload"}
          </h3>
          <p className="text-sm text-black max-w-md mx-auto">
            Upload your directory structure and let our AI assistant help you
            analyze them
          </p>
        </motion.div>
      </motion.div>

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-black/5 rounded-lg"
        >
          <div className="flex items-center justify-center gap-2 text-black">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing directory structure...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FileUpload;
