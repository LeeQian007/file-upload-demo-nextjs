"use client";
import React, { ChangeEvent, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { instanceAxios } from "@/lib/axios-instance";

type Props = {};

const SingleFileUpload = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [base, setBase] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);

  const changeBase64 = (file: File) => {
    return new Promise((resolve) => {
      let fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = (ev) => {
        resolve(ev.target?.result);
      };
    });
  };

  const handleChoose = () => {
    if (!uploadRef.current) {
      return null;
    }
    uploadRef.current.click();
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return null;
    }
    if (e.target.files[0].size > 2 * 1024 * 1024) {
      alert("File size is too large");
    }
    setFile(e.target.files[0]);
    const base = await changeBase64(e.target.files[0]).then((result) => result);

    setBase(base as string);
  };

  const handleMove = () => {
    setFile(null);
    uploadRef.current!.value = "";
  };

  const handleUpload = async () => {
    toast("Uploading");
    try {
      // encodeURLComponent : help solve garbled code problem
      const response = await instanceAxios.post(
        "/api/upload-base64",
        { file: encodeURIComponent(base!), fileName: file?.name },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.status === 200) {
        toast("Upload Success");
        handleMove();
      }
    } catch (error) {
      alert("File upload failed.");
    } finally {
    }
  };
  return (
    <div className="p-4 w-full md:w-[50%]">
      <h1 className="text-sky-600">
        Single File upload using 「BASE64 + THUMBNAIL」
      </h1>
      <div className="flex flex-col p-4 border-dotted border-4 rounded-lg min-h-[400px] h-[400px]">
        <div className="flex justify-between gap-4">
          <input
            accept="image/png,image/jpg, image/jpeg, image/webp"
            type="file"
            className="hidden"
            ref={uploadRef}
            onChange={handleChange}
          />
          <Button onClick={handleChoose} className="flex-1">
            Choose File
          </Button>
          <Button disabled={!file} onClick={handleUpload} className="flex-1">
            Upload to The Server
          </Button>
        </div>
        <p className="py-4">
          only .PNG/.JPG/.JPEG are allowed and max size is 2MB
        </p>
        {file && (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={base!}
              alt={file.name}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="flex items-center gap-4 p-4">
              <p>{file.name}</p>
              <Button onClick={handleMove} variant="destructive">
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer hideProgressBar autoClose={2000} />
    </div>
  );
};

export default SingleFileUpload;
