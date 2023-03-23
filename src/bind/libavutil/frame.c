#include<libavutil/frame.h>
#include<emscripten.h>

#define A(prefix, struc, type, field) \
		EMSCRIPTEN_KEEPALIVE \
    type prefix ## _ ## field(struc *a) { return a->field; }

#define AL(prefix, struc, type, field) \
		EMSCRIPTEN_KEEPALIVE \
    uint32_t prefix ## _ ## field(struc *a) { return (uint32_t) a->field; } \
		EMSCRIPTEN_KEEPALIVE \
    uint32_t prefix ## _ ## field ## _ ## high(struc *a) { return (uint32_t) (a->field >> 32); }

#define AA(prefix, struc, type, field) \
		EMSCRIPTEN_KEEPALIVE \
    type prefix ## _ ## field(struc *a, size_t c) { return a->field[c]; }
/**
 * struct AVFrame
 */

#define B(type, field) A(_avframe, AVFrame, type, field)
#define BL(type, field) AL(_avframe, AVFrame, type, field)
#define BA(type, field) AA(_avframe, AVFrame, type, field)
BL(uint64_t, channel_layout)
B(int, channels)
BA(uint8_t *, data)
B(int, format)
B(int, height)
B(int, key_frame)
BA(int, linesize)
B(int, nb_samples)
// B(int, pict_type)
BL(int64_t, pts)
B(int, sample_rate)
B(int, width)

EMSCRIPTEN_KEEPALIVE
void _avframe_pict_type(AVFrame *f, enum AVPictureType pict_type) {
	f->pict_type = pict_type;
}

EMSCRIPTEN_KEEPALIVE
int _avframe_sample_aspect_ratio_num(AVFrame *a) {
    return a->sample_aspect_ratio.num;
}

EMSCRIPTEN_KEEPALIVE
int _avframe_sample_aspect_ratio_den(AVFrame *a) {
    return a->sample_aspect_ratio.den;
}

