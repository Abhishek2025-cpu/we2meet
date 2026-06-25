const cloudinary =
require("../config/cloudinary");

const VideoIntro =
require(
"../models/videoIntro.model"
);

exports.uploadVideoIntro =
async (req, res) => {
try {
if (!req.file) {
return res
.status(400)
.json({
success: false,
message:
"Video is required"
});
}


  const {
    description
  } = req.body;

  const uploadResult =
    await new Promise(
      (
        resolve,
        reject
      ) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder:
                "we2meet/video-intros",
              resource_type:
                "video"
            },
            (
              error,
              result
            ) => {
              if (
                error
              )
                return reject(
                  error
                );

              resolve(
                result
              );
            }
          );

        stream.end(
          req.file.buffer
        );
      }
    );

  const existing =
    await VideoIntro.findOne(
      {
        userId:
          req.user._id
      }
    );

  if (existing) {
    existing.videoUrl =
      uploadResult.secure_url;

    existing.description =
      description ||
      existing.description;

    await existing.save();

    return res.json({
      success: true,
      message:
        "Video updated successfully",
      data: existing
    });
  }

  const video =
    await VideoIntro.create(
      {
        userId:
          req.user._id,
        videoUrl:
          uploadResult.secure_url,
        description
      }
    );

  res.status(201).json({
    success: true,
    message:
      "Video uploaded successfully",
    data: video
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message:
      error.message
  });
}


};

exports.getMyVideoIntro =
async (req, res) => {
try {
const video =
await VideoIntro.findOne(
{
userId:
req.user._id
}
);


  res.json({
    success: true,
    data: video
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message:
      error.message
  });
}


};

exports.getVideoByUserId =
async (req, res) => {
try {
const video =
await VideoIntro.findOne(
{
userId:
req.params.userId
}
).populate(
"userId",
"legalName primaryProfilePhoto"
);


  res.json({
    success: true,
    data: video
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message:
      error.message
  });
}


};

exports.deleteVideoIntro =
async (req, res) => {
try {
await VideoIntro.findOneAndDelete(
{
userId:
req.user._id
}
);

  res.json({
    success: true,
    message:
      "Video deleted successfully"
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message:
      error.message
  });
}

};
