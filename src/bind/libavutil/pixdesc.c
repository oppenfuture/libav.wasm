#include<libavutil/pixdesc.h>
#include<emscripten.h>

/* AVPixFmtDescriptor */
EMSCRIPTEN_KEEPALIVE
uint8_t _avpixfmtdescriptor_log2_chroma_h(AVPixFmtDescriptor *a) { return a->log2_chroma_h; }
