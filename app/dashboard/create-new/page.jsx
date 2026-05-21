"use client";

import React, { useContext, useState } from "react";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "@clerk/nextjs";

import { storage } from "../../../config/firebaseConfig";
import { db } from "../../../config/db";
import { Users } from "../../../config/schema";
import { UserDetailContext } from "../../_context/UserDetailContext";

import ImageSelection from "./_components/ImageSelection";
import RoomType from "./_components/RoomType";
import DesignType from "./_components/DesignType";
import AdditionalReq from "./_components/AdditionalReq";
import CustomLoading from "./_components/CustomLoading";
import AiOutputDialog from "./_components/AiOutputDialog";

function CreateNew() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiOutputImage, setAiOutputImage] = useState();
  const [openOutputDialog, setOpenOutputDialog] = useState(false);
  const [orgImage, setOrgImage] = useState();

  const { user } = useUser();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  const saveRawImageToFirebase = async () => {
    const fileName = Date.now() + "_raw.png";
    const imageRef = ref(storage, "interior-ai/" + fileName);

    await uploadBytes(imageRef, formData?.image);

    const downloadUrl = await getDownloadURL(imageRef);
    console.log("File Uploaded:", downloadUrl);

    setOrgImage(downloadUrl);

    return downloadUrl;
  };

  const updateUserCredits = async () => {
    const result = await db
      .update(Users)
      .set({
        credits: userDetail?.credits - 1,
      })
      .returning({ id: Users.id });

    if (result) {
      setUserDetail((prev) => ({
        ...prev,
        credits: userDetail?.credits - 1,
      }));

      return result[0].id;
    }
  };

  const generateAIImage = async () => {
    try {
      setLoading(true);

      const rawImageUrl = await saveRawImageToFirebase();

      const result = await axios.post("/api/interior-ai", {
        imageUrl: rawImageUrl,
        roomType: formData?.roomType,
        designType: formData?.designType,
        additionalReq: formData?.additionalReq,
        userEmail: user?.primaryEmailAddress?.emailAddress,
      });

      console.log(result.data);

      setAiOutputImage(result.data.result);

      await updateUserCredits();

      setOpenOutputDialog(true);
      setLoading(false);
    } catch (error) {
      console.error("AI image generation failed:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-bold text-4xl text-primary text-center">
        AI Interior
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-10 gap-10">
        <ImageSelection
          selectedFile={(file) => onHandleInputChange("image", file)}
        />

        <div>
          <RoomType
            selectedRoomType={(value) =>
              onHandleInputChange("roomType", value)
            }
          />

          <DesignType
            selectedDesignType={(value) =>
              onHandleInputChange("designType", value)
            }
          />

          <AdditionalReq
            additionalRequirementInput={(value) =>
              onHandleInputChange("additionalReq", value)
            }
          />

          <button
            className="btn btn-primary w-full mt-5"
            onClick={generateAIImage}
          >
            Generate
          </button>
        </div>
      </div>

      <CustomLoading loading={loading} />

      <AiOutputDialog
        openDialog={openOutputDialog}
        setOpenDialog={setOpenOutputDialog}
        orgImage={orgImage}
        aiImage={aiOutputImage}
      />
    </div>
  );
}

export default CreateNew;