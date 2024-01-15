"use client";
import React, { ChangeEvent, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { instanceAxios } from "@/lib/axios-instance";
import SparkMD5 from "spark-md5";
import path from "path";

type Props = {};
type BufferPack = {
  buffer: ArrayBuffer;
  HASH: string;
  suffix: string;
  filename: string;
};

const BigFileUpload = (props: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const changeBuffer = (file: File) => {
    return new Promise((resolve) => {
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (ev) => {
        let buffer = ev.target?.result as ArrayBuffer;
        let spark = new SparkMD5.ArrayBuffer();
        spark.append(buffer);
        let HASH = spark.end();
        let suffix = path.extname(file.name);
        resolve({
          buffer,
          HASH,
          suffix,
          filename: `${HASH}.${suffix}`,
        });
      };
    });
  };

  const loadVideo = (file: File) => {
    return new Promise<HTMLVideoElement | null>((resolve, reject) => {
      const dataUrl = URL.createObjectURL(file);
      console.log(videoRef);
      if (videoRef.current) {
        videoRef.current.onloadeddata = function () {
          resolve(videoRef.current);
        };
        videoRef.current.onerror = function () {
          reject("video loaded failed.");
        };
        videoRef.current.setAttribute("preload", "auto");
        videoRef.current.src = dataUrl;
        console.log("set yeah");
      }
    });
  };

  const handleChoose = () => {
    if (!uploadRef.current) {
      return null;
    }
    uploadRef.current.click();
  };

  const handleMove = () => {
    setFile(null);
    uploadRef.current!.value = "";
  };

  const handleChange = async () => {
    if (!uploadRef.current) {
      return null;
    }
    const file = uploadRef.current.files![0];
    setFile(file);
    console.log(file);

    try {
      const video = await loadVideo(file);
      const duration = video?.duration;
      const width = video?.videoWidth;
      const height = video?.height;
      console.log(video);
    } catch (error) {
      console.log(error);
    }

    //       const canvasElem = document.createElement('canvas')

    // canvasElem.width = width
    // canvasElem.height = height
    // canvasElem.getContext('2d').drawImage(videoElem, 0, 0, videoWidth, videoHeight)
    // // 导出成blob文件
    // canvasElem.toBlob(blob => {
    //   // 将blob文件转换成png文件
    //   const thumbFile = toThumbFile(blob)
    // }, 'image/png')

    // let bufferPack = (await changeBuffer(file).then(
    //   (res) => res
    // )) as BufferPack;
    // let Hash = bufferPack.HASH;

    // // /upload-already 断点续传
    // try {
    //   const res = instanceAxios.get("/api/upload-already", {
    //     params: { Hash },
    //   });
    //   console.log(res);
    // } catch (error) {
    //   console.log(error);
    // }
  };
  const handleUpload = () => {};

  return (
    <div className="p-4 w-full md:w-[50%]">
      <h1 className="text-sky-600">Big Video File upload using 「SLICE」</h1>
      <div className="flex flex-col p-4 border-dotted border-4 rounded-lg min-h-[400px] h-[400px]">
        <div className="flex justify-between gap-4">
          <input
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

        {file && (
          <div>
            <video src="" ref={videoRef}></video>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* <img
              src={base!}
              alt={file.name}
              className="w-full h-full object-cover rounded-lg"
            /> */}
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

export default BigFileUpload;
