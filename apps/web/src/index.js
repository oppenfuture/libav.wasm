/**
 * @ref: https://github.com/leandromoreira/ffmpeg-libav-tutorial/blob/46e8aba7bf1bc337d9b665f3541449d45e9d4202/3_transcoding.c
 */

// @ts-nocheck
import createLibavCore from "@ffmpeg/libav-core";
import { openMedia, initLibav } from "@ffmpeg/libav";
import * as YUVCanvas from "yuv-canvas";
import * as YUVBuffer from "yuv-buffer";

// load libav module.
async function init(wasmLocate) {
  console.time("load-libav");
  const libavCore = await createLibavCore({ locateFile: (path, scriptDirectory) => { return wasmLocate+'/'+path } });
  console.timeEnd("load-libav");
  console.log(libavCore)
  return libavCore;
}

export const main = async (url,wasmLocate) => {
  const libavCore = await init(wasmLocate);

  const {
    FS: { writeFile, readFile },
    NULL,
    ref,
    deref,
    stringToPtr,
    AVPixelFormat,
    AVIOContext,
    AVCodec,
    AVCodecContext,
    AVDictionary,
    AVERROR_EAGAIN,
    AVERROR_EOF,
    AVFMT_GLOBALHEADER,
    AVFMT_NOFILE,
    AVFormatContext,
    AVFrame,
    AVIO_FLAG_WRITE,
    AVMEDIA_TYPE_AUDIO,
    AVMEDIA_TYPE_VIDEO,
    AVPacket,
    AVRational,
    AVStream,
    AV_CODEC_FLAG_GLOBAL_HEADER,
    AV_PICTURE_TYPE_NONE,
    __av_guess_frame_rate,
    __av_inv_q,
    __av_packet_rescale_ts,
    _av_dict_set,
    _av_frame_alloc,
    _av_frame_unref,
    _av_interleaved_write_frame,
    _av_opt_set,
    _av_packet_alloc,
    _av_packet_free,
    _av_packet_unref,
    _av_read_frame,
    _av_seek_frame,
    _av_write_trailer,
    _avcodec_alloc_context3,
    _avcodec_find_decoder,
    _avcodec_find_encoder_by_name,
    _avcodec_flush_buffers,
    _avcodec_open2,
    _avcodec_parameters_copy,
    _avcodec_parameters_from_context,
    _avcodec_parameters_to_context,
    _avcodec_receive_frame,
    _avcodec_receive_packet,
    _avcodec_send_frame,
    _avcodec_send_packet,
    _avformat_alloc_output_context2,
    _avformat_new_stream,
    _avformat_write_header,
    _avio_open,
    _free,
  } = libavCore;
  initLibav(libavCore);



class StreamingParams {
  copy_audio = 0;
  copy_video = 0;
  output_extension = NULL;
  muxer_opt_key = NULL;
  muxer_opt_value = NULL;
  video_codec = NULL;
  audio_codec = NULL;
  codec_priv_key = NULL;
  codec_priv_value = NULL;
}

class StreamingContext {
  avfc = new AVFormatContext(NULL);
  video_avc = new AVCodec(NULL);
  audio_avc = new AVCodec(NULL);
  video_avs = new AVStream(NULL);
  audio_avs = new AVStream(NULL);
  video_avcc = new AVCodecContext(NULL);
  audio_avcc = new AVCodecContext(NULL);
  video_index = -1;
  audio_index = -1;
  filename = NULL;
}

const fill_stream_info = (avs, avc, avcc) => {
  avc.ptr = _avcodec_find_decoder(avs.codecpar.codec_id);
  console.log("find the codec",avs.codecpar.codec_id,avc.ptr);
  if (!avc.ptr) {
    console.log("failed to find the codec",avc);
    return -1;
  }

  avcc.ptr = _avcodec_alloc_context3(avc.ptr);
  if (!avcc.ptr) {
    console.log("failed to alloc memory for codec context");
    return -1;
  }

  if (_avcodec_parameters_to_context(avcc.ptr, avs.codecpar.ptr) < 0) {
    console.log("failed to fill codec context");
    return -1;
  }

  if (_avcodec_open2(avcc.ptr, avc.ptr, NULL) < 0) {
    console.log("failed to open codec");
    return -1;
  }

  return 0;
};

const prepare_decoder = (sc) => {
  for (let i = 0; i < sc.avfc.nb_streams; i++) {
    const codec_type = sc.avfc.nth_stream(i).codecpar.codec_type;
    if (codec_type === AVMEDIA_TYPE_VIDEO) {
      console.log('video codec')
      sc.video_avs = sc.avfc.nth_stream(i);
      sc.video_index = i;
      if (fill_stream_info(sc.video_avs, sc.video_avc, sc.video_avcc))
        return -1;
    } else if (codec_type === AVMEDIA_TYPE_AUDIO) {
      // console.log('audio codec')
      // sc.audio_avs = sc.avfc.nth_stream(i);
      // sc.audio_index = i;
      // if (fill_stream_info(sc.audio_avs, sc.audio_avc, sc.audio_avcc))
      //   return -1;
    } else {
      console.log("skipping streams other than audio and video");
    }
  }

  return 0;
};


const remux = (pkt, avfc, decoder_tb, encoder_tb) => {
  __av_packet_rescale_ts(pkt.ptr, decoder_tb.ptr, encoder_tb.ptr);
  if (_av_interleaved_write_frame(avfc.ptr, pkt.ptr) < 0) {
    console.log("error while copying stream packet");
    return -1;
  }
  return 0;
};

const encode_audio = (decoder, encoder, input_frame) => {
  const output_packet = new AVPacket(_av_packet_alloc());
  if (!output_packet) {
    console.log("could not allocate memory for output packet");
    return -1;
  }

  let response = _avcodec_send_frame(encoder.audio_avcc.ptr, input_frame.ptr);

  while (response >= 0) {
    response = _avcodec_receive_packet(
      encoder.audio_avcc.ptr,
      output_packet.ptr
    );

    if (response === AVERROR_EAGAIN || response === AVERROR_EOF) {
      break;
    } else if (response < 0) {
      console.log("Error while receiving packet from encoder", response);
      return response;
    }

    output_packet.stream_index = decoder.audio_index;

    __av_packet_rescale_ts(
      output_packet.ptr,
      decoder.audio_avs.time_base.ptr,
      encoder.audio_avs.time_base.ptr
    );
    response = _av_interleaved_write_frame(encoder.avfc.ptr, output_packet.ptr);
    if (response != 0) {
      console.log("Error while receiving packet from decoder", response);
      return -1;
    }
  }
  _av_packet_unref(output_packet.ptr);
  _av_packet_free(ref(output_packet.ptr));
  return 0;
};

const transcode_audio = (decoder, encoder, input_packet, input_frame) => {
  let response = _avcodec_send_packet(decoder.audio_avcc.ptr, input_packet.ptr);
  if (response < 0) {
    console.log("Error while sending packet to decoder", response);
    return response;
  }

  while (response >= 0) {
    response = _avcodec_receive_frame(decoder.audio_avcc.ptr, input_frame.ptr);

    if (response === AVERROR_EAGAIN || response === AVERROR_EOF) {
      break;
    } else if (response < 0) {
      console.log("Error while receiving frame from decoder", response);
      return response;
    }

    if (response >= 0) {
      if (encode_audio(decoder, encoder, input_frame)) return -1;
    }
    _av_frame_unref(input_frame.ptr);
  }
  return 0;
};
  let cur_frame = -1;
const transcode_video = async (decoder, encoder, input_packet, input_frame) => {
  let response = _avcodec_send_packet(decoder.video_avcc.ptr, input_packet.ptr);
  if (response < 0) {
    console.log("Error while sending packet to decoder", response);
    return response;
  }

  while (response >= 0) {
    response = _avcodec_receive_frame(decoder.video_avcc.ptr, input_frame.ptr);
    if (response === AVERROR_EAGAIN || response === AVERROR_EOF) {
      break;
    } else if (response < 0) {
      console.log("Error while receiving frame from decoder", response);
      return response;
    }
    const frame_data = _outputVideoFrame(input_frame.copyout_frame(),AVPixelFormat);
    const raw = frame_data.data;
    // console.log('input frame', input_frame.ptr, input_frame.width, input_frame.height)
    await new Promise((resolve, reject) => {
      setTimeout(resolve, 50);
    })
    draw(raw, input_frame.linesize[0], input_frame.height);
    _av_frame_unref(input_frame.ptr);


    cur_frame++;
    if (cur_frame === video_information.nb_frames-1) {
      cur_frame = -1;
      // console.log(decoder.avfc.ptr, decoder.video_index, 0, 1);
      _avcodec_flush_buffers(decoder.video_avcc.ptr);
      console.log('seek', _av_seek_frame(decoder.avfc.ptr, -1, 0, 0));
    }
  }
  return 0;
};

  const iFileName = "test"; //basename(iFilePath);
  const response = await fetch(url);
  const arraybuffer = await response.arrayBuffer();
  const media = new Uint8Array(arraybuffer);

  writeFile(iFileName, media);

  const oFileName = "out"; //basename(oFilePath);

  const sp = new StreamingParams();
  sp.copy_audio = 1;
  sp.copy_video = 0;
  sp.video_codec = stringToPtr("libx264");
  sp.codec_priv_key = stringToPtr("x264-params");
  sp.codec_priv_value = stringToPtr(
    "keyint=60:min-keyint=60:scenecut=0:force-cfr=1"
  );

  const decoder = new StreamingContext();
  console.log(decoder)
  decoder.filename = stringToPtr(iFileName);

  const encoder = new StreamingContext();
  encoder.filename = stringToPtr(oFileName);

  decoder.avfc = openMedia(iFileName);
  if (!decoder.avfc) return -1;
  if (prepare_decoder(decoder)) return -1;

  const video_information = {
    duration: decoder.avfc.duration,
    nb_frames: decoder.video_avs.nb_frames,
    width: decoder.video_avcc.width,
    height: decoder.video_avcc.height,
    frame_rate: decoder.video_avs.avg_frame_rate.num / decoder.video_avs.avg_frame_rate.den,
  }

  const muxer_opts = new AVDictionary(NULL);

  if (sp.muxer_opt_key && sp.muxer_opt_value) {
    const ptr = ref(muxer_opts.ptr);
    _av_dict_set(ptr, sp.muxer_opt_key, sp.muxer_opt_value, 0);
    muxer_opts.ptr = deref(ptr);
    _free(ptr);
  }

  let ptr = ref(muxer_opts.ptr);
  muxer_opts.ptr = deref(ptr);
  _free(ptr);

  const input_frame = new AVFrame(_av_frame_alloc());
  console.log('frame',input_frame.ptr)
  if (!input_frame.ptr) {
    console.log("failed to allocate memory for AVFrame");
    return -1;
  }
  const input_packet = new AVPacket(_av_packet_alloc());
  if (!input_packet.ptr) {
    console.log("failed to allocate memory for AVPacket");
    return -1;
  }

  console.log("start to transcode");
  console.time("transcode");
  while (_av_read_frame(decoder.avfc.ptr, input_packet.ptr) >= 0) {
    if (
      decoder.avfc.nth_stream(input_packet.stream_index).codecpar.codec_type ===
      AVMEDIA_TYPE_VIDEO
    ) {
      if (!sp.copy_video) {
        if (await transcode_video(decoder, encoder, input_packet, input_frame))
          return -1;
        _av_packet_unref(input_packet.ptr);
        // return 0;
      } else {
        if (
          remux(
            input_packet,
            encoder.avfc,
            decoder.video_avs.time_base,
            encoder.video_avs.time_base
          )
        )
          return -1;
      }
    } else if (
      decoder.avfc.nth_stream(input_packet.stream_index).codecpar.codec_type ===
      AVMEDIA_TYPE_AUDIO
    ) {
    } else {
      console.log("ignore all non video or audio packets");
    }
  }

  // if (encode_video(decoder, encoder, NULL)) return -1;
  console.timeEnd("transcode");


  // TODO: free resources.

  return 0;
};

function _outputVideoFrame(frame,AVPixelFormat) {

  // 1. format
  let format;
  // console.log("format: " + frame.format)
  switch (frame.format) {
    case AVPixelFormat.AV_PIX_FMT_YUV420P:
      format = "I420";
      break;

    case AVPixelFormat.AV_PIX_FMT_YUVA420P:
      format = "I420A";
      break;

    case AVPixelFormat.AV_PIX_FMT_YUV422P:
      format = "I422";
      break;

    case AVPixelFormat.AV_PIX_FMT_YUV444P:
      format = "I444";
      break;

    case AVPixelFormat.AV_PIX_FMT_NV12:
      format = "NV12";
      break;

    case AVPixelFormat.AV_PIX_FMT_RGBA:
      format = "RGBA";
      break;

    case AVPixelFormat.AV_PIX_FMT_BGRA:
      format = "BGRA";
      break;

    default:
      throw new DOMException("Unsupported AVPixelFormat format!", "EncodingError")
  }

  // 2. width and height
  const codedWidth = frame.width;
  const codedHeight = frame.height;

  // Check for non-square pixels
  let displayWidth = codedWidth;
  let displayHeight = codedHeight;
  if (frame.sample_aspect_ratio[0]) {
    const sar = frame.sample_aspect_ratio;
    if (sar[0] > sar[1])
      displayWidth = ~~(codedWidth * sar[0] / sar[1]);
    else
      displayHeight = ~~(codedHeight * sar[1] / sar[0]);
  }

  // 3. timestamp
  const timestamp = (frame.ptshi * 0x100000000 + frame.pts) * 1000;

  // 4. data
  let raw;//Uint8Array;
  {
    let size = 0;
    const planes = numPlanes(format);
    const sbs = [];
    const hssfs = [];
    const vssfs = [];
    for (let i = 0; i < planes; i++) {
      sbs.push(sampleBytes(format, i));
      hssfs.push(horizontalSubSamplingFactor(format, i));
      vssfs.push(verticalSubSamplingFactor(format, i));
    }
    for (let i = 0; i < planes; i++) {
      size += frame.width * frame.height * sbs[i] / hssfs[i]
        / vssfs[i];
    }
  }

  return { data: frame.data, format, codedWidth, codedHeight, displayWidth, displayHeight, timestamp };
}

function numPlanes(format) {
  switch (format) {
      case "I420":
      case "I422":
      case "I444":
          return 3;

      case "I420A":
          return 4;

      case "NV12":
          return 2;

      case "RGBA":
      case "RGBX":
      case "BGRA":
      case "BGRX":
          return 1;

      default:
          throw new DOMException("Unsupported video pixel format", "NotSupportedError");
  }
}

function sampleBytes(format, planeIndex) {
  switch (format) {
      case "I420":
      case "I420A":
      case "I422":
      case "I444":
          return 1;

      case "NV12":
          if (planeIndex === 1)
              return 2;
          else
              return 1;

      case "RGBA":
      case "RGBX":
      case "BGRA":
      case "BGRX":
          return 4;

      default:
          throw new DOMException("Unsupported video pixel format", "NotSupportedError");
  }
}


/**
 * Horizontal sub-sampling factor for the given format and plane.
 * @param format  The format
 * @param planeIndex  The plane index
 */
function horizontalSubSamplingFactor(
  format, planeIndex
) {
  // First plane (often luma) is always full
  if (planeIndex === 0)
    return 1;

  switch (format) {
    case "I420":
    case "I422":
      return 2;

    case "I420A":
      if (planeIndex === 3)
        return 1;
      else
        return 2;

    case "I444":
      return 1;

    case "NV12":
      return 2;

    case "RGBA":
    case "RGBX":
    case "BGRA":
    case "BGRX":
      return 1;

    default:
      throw new DOMException("Unsupported video pixel format", "NotSupportedError");
  }
}

/**
* Vertical sub-sampling factor for the given format and plane.
* @param format  The format
* @param planeIndex  The plane index
*/
function verticalSubSamplingFactor(
  format, planeIndex
) {
  // First plane (often luma) is always full
  if (planeIndex === 0)
    return 1;

  switch (format) {
    case "I420":
      return 2;

    case "I420A":
      if (planeIndex === 3)
        return 1;
      else
        return 2;

    case "I422":
    case "I444":
      return 1;

    case "NV12":
      return 2;

    case "RGBA":
    case "RGBX":
    case "BGRA":
    case "BGRX":
      return 1;

    default:
      throw new DOMException("Unsupported video pixel format", "NotSupportedError");
  }
}


const canvas = document.getElementById('yuv');
let yuvCanvas = YUVCanvas.attach(canvas),
  format,
  frame,
  sourceData = {},
  sourceFader = {
    y: 1,
    u: 1,
    v: 1
  };

function draw(raw, width, height) {
  format = YUVBuffer.format({
    width: width,
    height: height,
    chromaWidth: width / 2,
    chromaHeight: height / 2
  });
  frame = YUVBuffer.frame(format);
  sourceData["y"] = raw[0];
  sourceData["u"] = raw[1];
  sourceData["v"] = raw[2];
  frame.y = {
    bytes: sourceData["y"],
    stride:width
  }
  frame.u = {
    bytes: sourceData["u"],
    stride:width/2
  }
  frame.v = {
    bytes: sourceData["v"],
    stride:width/2
  }
  yuvCanvas.drawFrame(frame);
}
