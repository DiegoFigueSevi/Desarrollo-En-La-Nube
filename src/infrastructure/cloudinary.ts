export const uploadToCloudinary = async (file: File): Promise<{ url: string; }> => {
  const url = `https://api.cloudinary.com/v1_1/drbpk4dsk/upload`;
  const preset = "desarrollo_en_la_nube";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      return { url: data.secure_url };
    } else {
      console.error("Cloudinary error:", data);
      throw new Error("Error al subir la imagen a Cloudinary");
    }
  } catch (error) {
    console.error("Error al subir a Cloudinary", error);
    throw error;
  }
};
