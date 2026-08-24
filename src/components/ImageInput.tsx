'use client';

import { RefObject, useRef, useState } from 'react';
import { pngToJpegWithExif, jpgToJpegWithExif } from '@/utility/exif-client';
import { clsx } from 'clsx/lite';
import { ACCEPTED_PHOTO_FILE_TYPES } from '@/photo';
import { FiUploadCloud } from 'react-icons/fi';
import { MAX_IMAGE_SIZE } from '@/platforms/next-image';
import ProgressButton from './primitives/ProgressButton';
import { useAppState } from '@/app/AppState';
import { useAppText } from '@/i18n/state/client';

export default function ImageInput({
  ref: inputRefExternal,
  id = 'file',
  onStart,
  onBlobReady,
  shouldResize,
  maxSize = MAX_IMAGE_SIZE,
  quality = 0.9,
  showButton,
  disabled: disabledProp,
  debug: _debug,
}: {
  ref?: RefObject<HTMLInputElement | null>
  id?: string
  onStart?: () => void
  onBlobReady?: (args: {
    blob: Blob,
    extension?: string,
    hasMultipleUploads?: boolean,
    isLastBlob?: boolean,
  }) => Promise<any>
  shouldResize?: boolean
  maxSize?: number
  quality?: number
  showButton?: boolean
  disabled?: boolean
  debug?: boolean
}) {
  const inputRefInternal = useRef<HTMLInputElement>(null);

  const inputRef = inputRefExternal ?? inputRefInternal;

  const {
    uploadState: {
      isUploading,
      filesLength,
      fileUploadIndex,
    },
    setUploadState,
    resetUploadState,
  } = useAppState();

  const appText = useAppText();

  const disabled = disabledProp || isUploading;

  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: File[]) => {
    const acceptedFiles = files.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return ACCEPTED_PHOTO_FILE_TYPES.includes(file.type) ||
        extension === 'jpg' ||
        extension === 'jpeg' ||
        extension === 'png';
    });

    if (disabled || acceptedFiles.length === 0) {
      if (acceptedFiles.length === 0) { resetUploadState?.(); }
      return;
    }

    onStart?.();
    setUploadState?.({ filesLength: acceptedFiles.length });

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      setUploadState?.({
        fileUploadIndex: i,
        fileUploadName: file.name,
      });
      const inputExtension = file.name
        .split('.')
        .pop()?.toLowerCase();

      const isInputPng = inputExtension === 'png';

      const outputExtension = shouldResize
        ? 'jpeg'
        : inputExtension;

      const callbackArgs = {
        extension: outputExtension,
        hasMultipleUploads: acceptedFiles.length > 1,
        isLastBlob: i === acceptedFiles.length - 1,
      };

      let blob: Blob | File = file;

      if (shouldResize) {
        if (isInputPng) {
          blob = await pngToJpegWithExif(
            file,
            { maxSize, quality },
          ).catch(() => file);
        } else {
          blob = await jpgToJpegWithExif(
            file,
            { maxSize, quality },
          ).catch(() => file);
        }
      }

      await onBlobReady?.({
        ...callbackArgs,
        blob,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 min-w-0 w-full">
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="hidden!"
        accept={ACCEPTED_PHOTO_FILE_TYPES.join(',')}
        disabled={disabled}
        multiple
        onChange={async e => {
          const files = Array.from(e.currentTarget.files ?? []);
          if (files.length > 0) {
            await processFiles(files);
          } else {
            resetUploadState?.();
          }
        }}
      />
      {showButton &&
        <div
          className={clsx(
            'darkroom-upload-dropzone',
            isDragging && 'is-dragging',
            disabled && 'is-disabled',
          )}
          onDragEnter={e => {
            e.preventDefault();
            if (!disabled) { setIsDragging(true); }
          }}
          onDragOver={e => e.preventDefault()}
          onDragLeave={e => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setIsDragging(false);
            }
          }}
          onDrop={async e => {
            e.preventDefault();
            setIsDragging(false);
            await processFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <div className="darkroom-upload-glyph" aria-hidden="true">
            <FiUploadCloud size={24} />
          </div>
          <div className="darkroom-upload-copy">
            <span className="darkroom-upload-eyebrow">INGEST WORKSPACE</span>
            <strong>Drop photographs here</strong>
            <span>JPEG · PNG · EXIF preserved before upload</span>
          </div>
          <div className="darkroom-upload-action">
            <ProgressButton
              type="button"
              isLoading={disabled}
              progress={filesLength > 1
                ? (fileUploadIndex + 1) / filesLength * 0.95
                : undefined}
              icon={<FiUploadCloud
                size={18}
                className="translate-x-[-0.5px] translate-y-[0.5px]"
              />}
              aria-disabled={disabled}
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = '';
                  inputRef.current.click();
                }
              }}
              hideText="never"
              primary
            >
              {isUploading
                ? filesLength > 1
                  ? appText.utility.paginateAction(
                    fileUploadIndex + 1,
                    filesLength,
                    appText.admin.uploading,
                  )
                  : appText.admin.uploading
                : appText.admin.uploadPhotos}
            </ProgressButton>
          </div>
        </div>}
    </div>
  );
}
