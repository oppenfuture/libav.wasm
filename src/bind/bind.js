/**
 * Constants
 */

const NULL = 0;
const SIZE_I32 = Uint32Array.BYTES_PER_ELEMENT;

Module["NULL"] = NULL;
Module["SIZE_I32"] = SIZE_I32;

/**
 * Classes
 */

class Base {
  constructor(ptr) {
    this._ptr = ptr;
  }

  get ptr() {
    return this._ptr;
  }

  set ptr(p) {
    this._ptr = p;
  }
}

class AVFormatContext extends Base {
  get url() {
    const { UTF8ToString, __avformat_context_url } = Module;
    return UTF8ToString(__avformat_context_url(this.ptr));
  }

  get iformat() {
    return new AVInputFormat(Module["__avformat_context_iformat"](this.ptr));
  }

  get oformat() {
    return new AVOutputFormat(Module["__avformat_context_oformat"](this.ptr));
  }

  get pb() {
    return new AVIOContext(Module["__avformat_context_pb"](this.ptr));
  }

  get duration() {
    return Module["__avformat_context_duration"](this.ptr);
  }

  get bit_rate() {
    return Module["__avformat_context_bit_rate"](this.ptr);
  }

  get nb_streams() {
    return Module["__avformat_context_nb_streams"](this.ptr);
  }

  nth_stream(i) {
    return new AVStream(Module["__avformat_context_nth_stream"](this.ptr, i));
  }

  get flags() {
    return Module["__avformat_context_flags"](this.ptr);
  }

  set flags(f) {
    Module["__avformat_context_set_flags"](this.ptr, f);
  }

  set pb(p) {
    Module["__avformat_context_set_pb"](this.ptr, p.ptr);
  }
}

class AVInputFormat extends Base {
  get name() {
    const { UTF8ToString, __avinput_format_name } = Module;
    return UTF8ToString(__avinput_format_name(this.ptr));
  }
}

class AVOutputFormat extends Base {
  get flags() {
    return Module["__avoutput_format_flags"](this.ptr);
  }
}

class AVCodec extends Base {
  get pix_fmts() {
    return Module["__avcodec_pix_fmts"](this.ptr);
  }

  nth_pix_fmt(i) {
    return Module["__avcodec_nth_pix_fmt"](this.ptr, i);
  }
}

class AVStream extends Base {
  get codecpar() {
    return new AVCodecParameters(Module["__avstream_codecpar"](this.ptr));
  }

  get time_base() {
    return new AVRational(Module["__avstream_time_base"](this.ptr));
  }

  get avg_frame_rate() {
    return new AVRational(Module["__avstream_avg_frame_rate"](this.ptr));
  }

  get nb_frames() {
    return Module["__avstream_nb_frames"](this.ptr);
  }

  set time_base(tb) {
    Module["__avstream_set_time_base"](this.ptr, tb.ptr);
  }
}

class AVCodecContext extends Base {
  get priv_data() {
    return Module["__avcodec_context_priv_data"](this.ptr);
  }

  get height() {
    return Module["__avcodec_context_height"](this.ptr);
  }

  get width() {
    return Module["__avcodec_context_width"](this.ptr);
  }

  get sample_aspect_ratio() {
    return Module["__avcodec_context_sample_aspect_ratio"](this.ptr);
  }

  get time_base() {
    return new AVRational(Module["__avcodec_context_time_base"](this.ptr));
  }

  set height(h) {
    Module["__avcodec_context_set_height"](this.ptr, h);
  }

  set width(w) {
    Module["__avcodec_context_set_width"](this.ptr, w);
  }

  set sample_aspect_ratio(r) {
    Module["__avcodec_context_set_sample_aspect_ratio"](this.ptr, r);
  }

  set pix_fmt(pf) {
    Module["__avcodec_context_set_pix_fmt"](this.ptr, pf);
  }

  set bit_rate(r) {
    Module["__avcodec_context_set_bit_rate"](this.ptr, r);
  }

  set rc_buffer_size(s) {
    Module["__avcodec_context_set_rc_buffer_size"](this.ptr, s);
  }

  set rc_max_rate(r) {
    Module["__avcodec_context_set_rc_max_rate"](this.ptr, r);
  }

  set rc_min_rate(r) {
    Module["__avcodec_context_set_rc_min_rate"](this.ptr, r);
  }

  set time_base(tb) {
    Module["__avcodec_context_set_time_base"](this.ptr, tb.ptr);
  }

  set channels(channels) {
    Module["__avcodec_context_set_channels"](this.ptr, channels);
  }

  set channel_layout(cl) {
    Module["__avcodec_context_set_channel_layout"](this.ptr, cl);
  }

  set sample_fmt(sf) {
    Module["__avcodec_context_set_sample_fmt"](this.ptr, sf);
  }
}

class AVCodecParameters extends Base {
  get codec_id() {
    return Module["__avcodec_parameters_codec_id"](this.ptr);
  }

  get codec_type() {
    return Module["__avcodec_parameters_codec_type"](this.ptr);
  }
}

class AVRational extends Base {
  get num() {
    return Module["__avrational_num"](this.ptr);
  }

  get den() {
    return Module["__avrational_den"](this.ptr);
  }
}

class AVIOContext extends Base {}

class AVDictionary extends Base {}

class AVFrame extends Base {
  set pict_type(t) {
    Module["__avframe_pict_type"](this.ptr, t);
  }

  get width() {
    return Module["__avframe_width"](this.ptr);
  }

  get height() {
    return Module["__avframe_height"](this.ptr);
  }

  get format() {
    return Module["__avframe_format"](this.ptr);
  }

  get nb_samples() {
    return Module.__avframe_nb_samples(this.ptr);
  }

  get linesize() {
    let ret = [];
    for (var i = 0; i < 8 /* AV_NUM_DATA_POINTERS */; i++) {
      var linesize = Module.__avframe_linesize(this.ptr, i);
      ret.push(linesize);
      if (!linesize)
        break;
    }
    return ret;
  }

  copyout_frame() {
    return _copyout_frame(this.ptr);
  }
}

class AVPacket extends Base {
  get stream_index() {
    return Module["__avpacket_stream_index"](this.ptr);
  }

  set stream_index(si) {
    Module["__avpacket_set_stream_index"](this.ptr, si);
  }

  set duration(d) {
    Module["__avpacket_set_duration"](this.ptr, d);
  }
}

Module["AVFormatContext"] = AVFormatContext;
Module["AVInputFormat"] = AVInputFormat;
Module["AVCodec"] = AVCodec;
Module["AVStream"] = AVStream;
Module["AVCodecContext"] = AVCodecContext;
Module["AVCodecParameters"] = AVCodecParameters;
Module["AVRational"] = AVRational;
Module["AVIOContext"] = AVIOContext;
Module["AVDictionary"] = AVDictionary;
Module["AVFrame"] = AVFrame;
Module["AVPacket"] = AVPacket;

/**
 * Functions
 */

const stringToPtr = function (str) {
  const len = Module["lengthBytesUTF8"](str) + 1;
  const ptr = Module["_malloc"](len);
  Module["stringToUTF8"](str, ptr, len);

  return ptr;
};

const ref = function (p) {
  const ptr = Module["_malloc"](SIZE_I32);
  Module["setValue"](ptr, p, "i32");
  return ptr;
};

const deref = function (p) {
  return Module["getValue"](p, "i32");
};

Module["stringToPtr"] = stringToPtr;
Module["ref"] = ref;
Module["deref"] = deref;

/**
 * Initializer
 */

Module["onRuntimeInitialized"] = function () {
  Module["AVMEDIA_TYPE_VIDEO"] = Module["__avmedia_type_video"]();
  Module["AVMEDIA_TYPE_AUDIO"] = Module["__avmedia_type_audio"]();
  Module["AVFMT_GLOBALHEADER"] = Module["__avfmt_globalheader"]();
  Module["AV_CODEC_FLAG_GLOBAL_HEADER"] =
    Module["__av_codec_flag_global_header"]();
  Module["AVFMT_NOFILE"] = Module["__avfmt_nofile"]();
  Module["AVIO_FLAG_WRITE"] = Module["__avio_flag_write"]();
  Module["AVERROR_EOF"] = Module["__averror_eof"]();
  Module["AVERROR_EAGAIN"] = Module["__averror_eagain"]();
  Module["AV_PICTURE_TYPE_NONE"] = Module["__av_picture_type_none"]();
  Module["FF_COMPLIANCE_EXPERIMENTAL"] =
    Module["__ff_compliance_experimental"]();
};

var copyout_u8 = Module.copyout_u8 = function (ptr, len) {
  return (new Uint8Array(Module.HEAPU8.buffer, ptr, len)).slice(0);
};

var copyout_s16 = Module.copyout_s16 = function (ptr, len) {
  return (new Int16Array(Module.HEAPU8.buffer, ptr, len)).slice(0);
};

var copyout_s32 = Module.copyout_s32 = function (ptr, len) {
  return (new Int32Array(Module.HEAPU8.buffer, ptr, len)).slice(0);
};

var copyout_f32 = Module.copyout_f32 = function (ptr, len) {
  return (new Float32Array(Module.HEAPU8.buffer, ptr, len)).slice(0);
};

var _copyout_frame = Module._copyout_frame = function(frame) {
  var nb_samples = Module.__avframe_nb_samples(frame);
  if (nb_samples === 0) {
      // Maybe a video frame?
      var width = Module.__avframe_width(frame);
      if (width)
          return _copyout_frame_video(frame, width);
  }
  var channels = Module.__avframe_channels(frame);
  var format = Module.__avframe_format(frame);
  var outFrame = {
      data: null,
      channel_layout: Module.__avframe_channel_layout(frame),
      channels: channels,
      format: format,
      nb_samples: nb_samples,
      pts: Module.__avframe_pts(frame),
      ptshi: Module.__avframe_pts_high(frame),
      sample_rate: Module.__avframe_sample_rate(frame)
  };

  // FIXME: Need to support *every* format here
  if (format >= 5 /* U8P */) {
      // Planar format, multiple data pointers
      var data = [];
      for (var ci = 0; ci < channels; ci++) {
          var inData = Module.__avframe_data(frame, ci);
          switch (format) {
              case 5: // U8P
                  data.push(copyout_u8(inData, nb_samples));
                  break;

              case 6: // S16P
                  data.push(copyout_s16(inData, nb_samples));
                  break;

              case 7: // S32P
                  data.push(copyout_s32(inData, nb_samples));
                  break;

              case 8: // FLT
                  data.push(copyout_f32(inData, nb_samples));
                  break;
          }
      }
      outFrame.data = data;

  } else {
      var ct = channels*nb_samples;
      var inData = Module.__avframe_data(frame, 0);
      switch (format) {
          case 0: // U8
              outFrame.data = copyout_u8(inData, ct);
              break;

          case 1: // S16
              outFrame.data = copyout_s16(inData, ct);
              break;

          case 2: // S32
              outFrame.data = copyout_s32(inData, ct);
              break;

          case 3: // FLT
              outFrame.data = copyout_f32(inData, ct);
              break;
      }

  }

  return outFrame;
};

var _copyout_frame_video = Module._copyout_frame_video = function(frame, width) {
  var data = [];
  var height = Module.__avframe_height(frame);
  var format = Module.__avframe_format(frame);
  var desc = Module._av_pix_fmt_desc_get(format);
  var outFrame = {
      data: data,
      width: width,
      height: height,
      format: Module.__avframe_format(frame),
      key_frame: Module.__avframe_key_frame(frame),
      pict_type: Module.__avframe_pict_type(frame),
      pts: Module.__avframe_pts(frame),
      ptshi: Module.__avframe_pts_high(frame),
      sample_aspect_ratio: [
          Module.__avframe_sample_aspect_ratio_num(frame),
          Module.__avframe_sample_aspect_ratio_den(frame)
      ]
  };

  for (var i = 0; i < 8 /* AV_NUM_DATA_POINTERS */; i++) {
      var linesize = Module.__avframe_linesize(frame, i);
      if (!linesize)
          break;
      var inData = Module.__avframe_data(frame, i);
      var h = height;
      if (i === 1 || i === 2)
          h >>= Module.__avpixfmtdescriptor_log2_chroma_h(desc);
      data.push(copyout_u8(inData, linesize*h));
  }

  return outFrame;
};

function enume(vals, first) {
  let ret = {};
  var i = first;
  vals.forEach(function(val) {
      ret[val] = i++;
  });
  return ret;
}

// AVPixelFormat
Module['AVPixelFormat'] = enume(["AV_PIX_FMT_NONE", "AV_PIX_FMT_YUV420P",
"AV_PIX_FMT_YUYV422", "AV_PIX_FMT_RGB24", "AV_PIX_FMT_BGR24",
"AV_PIX_FMT_YUV422P", "AV_PIX_FMT_YUV444P",
"AV_PIX_FMT_YUV410P", "AV_PIX_FMT_YUV411P", "AV_PIX_FMT_GRAY8",
"AV_PIX_FMT_MONOWHITE", "AV_PIX_FMT_MONOBLACK",
"AV_PIX_FMT_PAL8", "AV_PIX_FMT_YUVJ420P",
"AV_PIX_FMT_YUVJ422P", "AV_PIX_FMT_YUVJ444P",
"AV_PIX_FMT_UYVY422", "AV_PIX_FMT_UYYVYY411",
"AV_PIX_FMT_BGR8", "AV_PIX_FMT_BGR4", "AV_PIX_FMT_BGR4_BYTE",
"AV_PIX_FMT_RGB8", "AV_PIX_FMT_RGB4", "AV_PIX_FMT_RGB4_BYTE",
"AV_PIX_FMT_NV12", "AV_PIX_FMT_NV21", "AV_PIX_FMT_ARGB",
"AV_PIX_FMT_RGBA", "AV_PIX_FMT_ABGR", "AV_PIX_FMT_BGRA",
"AV_PIX_FMT_GRAY16BE", "AV_PIX_FMT_GRAY16LE",
"AV_PIX_FMT_YUV440P", "AV_PIX_FMT_YUVJ440P",
"AV_PIX_FMT_YUVA420P", "AV_PIX_FMT_RGB48BE",
"AV_PIX_FMT_RGB48LE", "AV_PIX_FMT_RGB565BE",
"AV_PIX_FMT_RGB565LE", "AV_PIX_FMT_RGB555BE",
"AV_PIX_FMT_RGB555LE", "AV_PIX_FMT_BGR565BE",
"AV_PIX_FMT_BGR565LE", "AV_PIX_FMT_BGR555BE",
"AV_PIX_FMT_BGR555LE"], -1);
