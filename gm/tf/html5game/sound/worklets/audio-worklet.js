AudioWorkletProcessor.prototype._r = function() {
  this._s = true;
  this.port.onmessage = (_t) => {
    if (_t.data === "kill") this._s = false;
  };
};
class _u extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: "bypass",
      automationRate: "a-rate",
      defaultValue: 0,
      minValue: 0,
      maxValue: 1
    }];
  }
  constructor() {
    super();
    this._r();
  }
  process(_v, _w, parameters) {
    const _x = _v[0];
    for (let c = 0; c < _x.length; ++c) {
      const _y = _x[c];
      for (let _z = 0; _z < _y.length; ++_z) _w[parameters.bypass[_z] ?? parameters.bypass[0]][c][_z] = _y[_z];
    }
    return this._s;
  }
}
class _A extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: "gain",
      automationRate: "a-rate",
      defaultValue: 1,
      minValue: 0
    }];
  }
  constructor() {
    super();
    this._r();
  }
  process(_v, _w, parameters) {
    const _B = _v[0];
    const _C = _v[1];
    const _D = _w[0];
    const gain = parameters.gain;
    for (let c = 0; c < _C.length; ++c) {
      const _y = _C[c];
      const _E = _D[c];
      for (let _z = 0; _z < _y.length; ++_z) _E[_z] = _y[_z];
    }
    for (let c = 0; c < _B.length; ++c) {
      const _y = _B[c];
      const _E = _D[c];
      for (let _z = 0; _z < _y.length; ++_z) _E[_z] += _y[_z] * (gain[_z] ?? gain[0]);
    }
    return this._s;
  }
}
registerProcessor("audio-bus-input", _u);
registerProcessor("audio-bus-output", _A);
class _F extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: "bypass",
      automationRate: "a-rate",
      defaultValue: 0,
      minValue: 0,
      maxValue: 1
    }, {
      name: "gain",
      automationRate: "a-rate",
      defaultValue: 1.0,
      minValue: 0.0
    }, {
      name: "factor",
      automationRate: "a-rate",
      defaultValue: 20,
      minValue: 1,
      maxValue: 100
    }, {
      name: "resolution",
      automationRate: "a-rate",
      defaultValue: 8,
      minValue: 2,
      maxValue: 16
    }, {
      name: "mix",
      automationRate: "a-rate",
      defaultValue: 0.8,
      minValue: 0.0,
      maxValue: 1.0
    }];
  }
  static _G = [undefined, undefined, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
  constructor(_H) {
    super();
    this._r();
    const _I = _H.outputChannelCount[0];
    this._J = new Float32Array(_I);
    this._K = new Uint32Array(_I);
  }
  process(_v, _w, parameters) {
    const _x = _v[0];
    const _D = _w[0];
    const bypass = parameters.bypass;
    const gain = parameters.gain;
    const factor = parameters.factor;
    const resolution = parameters.resolution;
    const mix = parameters.mix;
    for (let c = 0; c < _x.length; ++c) {
      const _y = _x[c];
      const _E = _D[c];
      for (let _z = 0; _z < _y.length; ++_z) {
        _E[_z] = _y[_z];
        if (this._K[c] === 0) this._J[c] = _y[_z];
        ++this._K[c];
        this._K[c] %= (factor[_z] ?? factor[0]);
        if (bypass[_z] ?? bypass[0]) continue;
        let _L = this._J[c];
        const _M = (gain[_z] ?? gain[0]);
        _L *= _M;
        _L = Math.max(Math.min(_L, 1.0), -1.0);
        const _N = resolution[_z] ?? resolution[0];
        const max = (_L > 0.0) ? _F._G[_N] - 1 : _F._G[_N];
        _L = Math.round(_L * max) / max;
        const _O = (mix[_z] ?? mix[0]);
        _E[_z] *= (1.0 - _O);
        _E[_z] += (_L * _O);
      }
    }
    return this._s;
  }
}
registerProcessor("bitcrusher-processor", _F);
class _P extends AudioWorkletProcessor {
  static _Q = 5.0;
  static get parameterDescriptors() {
    return [{
      name: "bypass",
      automationRate: "a-rate",
      defaultValue: 0,
      minValue: 0,
      maxValue: 1
    }, {
      name: "time",
      automationRate: "a-rate",
      defaultValue: 0.2,
      minValue: 0.0,
      maxValue: _P._Q
    }, {
      name: "feedback",
      automationRate: "a-rate",
      defaultValue: 0.5,
      minValue: 0.0,
      maxValue: 1.0
    }, {
      name: "mix",
      automationRate: "a-rate",
      defaultValue: 0.35,
      minValue: 0.0,
      maxValue: 1.0
    }];
  }
  constructor(_H) {
    super();
    this._r();
    const _I = _H.outputChannelCount[0];
    const _R = (_P._Q * sampleRate) + 1;
    this.buffer = new Array(_I);
    this._S = new Uint32Array(_I);
    for (let c = 0; c < _I; ++c) this.buffer[c] = new Float32Array(_R);
  }
  process(_v, _w, parameters) {
    const _x = _v[0];
    const _D = _w[0];
    const bypass = parameters.bypass;
    const time = parameters.time;
    const feedback = parameters.feedback;
    const mix = parameters.mix;
    for (let c = 0; c < _x.length; ++c) {
      const _y = _x[c];
      const _E = _D[c];
      for (let _z = 0; _z < _y.length; ++_z) {
        _E[_z] = _y[_z];
        const _T = this._U(c, (time[_z] ?? time[0]));
        const _V = _y[_z] + (_T * (feedback[_z] ?? feedback[0]));
        this.write(c, _V);
        if ((bypass[_z] ?? bypass[0])) continue;
        const _O = (mix[_z] ?? mix[0]);
        _E[_z] *= (1 - _O);
        _E[_z] += (_T * _O);
      }
    }
    return this._s;
  }
  _U(_W, _X) {
    const _Y = _X * sampleRate;
    let _Z = (this._S[_W] - ~~_Y);
    let __ = (_Z - 1);
    while (_Z < 0) _Z += this.buffer[_W].length;
    while (__ < 0) __ += this.buffer[_W].length;
    const frac = _Y - ~~_Y;
    const _01 = this.buffer[_W][_Z];
    const _11 = this.buffer[_W][__];
    return _01 + (_11 - _01) * frac;
  }
  write(_W, _21) {
    ++this._S[_W];
    this._S[_W] %= this.buffer[_W].length;
    this.buffer[_W][this._S[_W]] = _21;
  }
}
registerProcessor("delay-processor", _P);
class _31 extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: "bypass",
      automationRate: "a-rate",
      defaultValue: 0,
      minValue: 0,
      maxValue: 1
    }, {
      name: "gain",
      automationRate: "a-rate",
      defaultValue: 0.5,
      minValue: 0.0
    }];
  }
  constructor() {
    super();
    this._r();
  }
  process(_v, _w, parameters) {
    const _x = _v[0];
    const _D = _w[0];
    const bypass = parameters.bypass;
    const gain = parameters.gain;
    for (let c = 0; c < _x.length; ++c) {
      const _y = _x[c];
      const _E = _D[c];
      for (let _z = 0; _z < _y.length; ++_z) {
        _E[_z] = _y[_z];
        if (bypass[_z] ?? bypass[0]) continue;
        _E[_z] *= (gain[_z] ?? gain[0]);
      }
    }
    return this._s;
  }
}
registerProcessor("gain-processor",
  _31);
class _41 extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    const _51 = Math.min(sampleRate / 2.0, 20000.0);
    return [{
      name: "bypass",
      automationRate: "a-rate",
      defaultValue: 0,
      minValue: 0,
      maxValue: 1
    }, {
      name: "cutoff",
      automationRate: "a-rate",
      defaultValue: Math.min(1500.0, _51),
      minValue: 10.0,
      maxValue: _51
    }, {
      name: "q",
      automationRate: "a-rate",
      defaultValue: 1.5,
      minValue: 1.0,
      maxValue: 100.0
    }];
  }
  constructor(_H) {
    super();
    this._r();
    const _I = _H.outputChannelCount[0];
    this._61 = 0;
    this._71 = 0;
    this._81 = 0;
    this._91 = 0;
    this._a1 = 0;
    this._b1 = new Float32Array(_I);
    this._c1 = new Float32Array(_I);
    this._d1 = new Float32Array(_I);
    this._e1 = new Float32Array(_I);
    this._f1 = -1;
    this._g1 = -1;
  }
  process(_v, _w, parameters) {
    const _x = _v[0];
    const _D = _w[0];
    const bypass = parameters.bypass;
    const cutoff = parameters.cutoff;
    const q = parameters.q;
    const _h1 = (cutoff.length === 1 && q.length === 1);
    if (_h1) this._i1(cutoff[0], q[0]);
    for (let c = 0; c < _x.length; ++c) {
      const _y = _x[c];
      const _E = _D[c];
      for (let _z = 0; _z < _y.length; ++_z) {
        if (!_h1) this._i1(cutoff[_z] ?? cutoff[0], q[_z] ?? q[0]);
        const _j1 = this._81 * _y[_z] + this._91 * this._b1[c] + this._a1 * this._c1[c] - this._61 * this._d1[c] - this._71 * this._e1[c];
        this._c1[c] = this._b1[c];
        this._b1[c] = _y[_z];
        this._e1[c] = this._d1[c];
        this._d1[c] = _j1;
        _E[_z] = (bypass[_z] ?? bypass[0]) ? _y[_z] : _j1;
      }
    }
    return this._s;
  }
  _i1(_k1, _l1) {
    if (_k1 === this._f1 && _l1 === this._g1) return;
    const _m1 = 2 * Math.PI * _k1 / sampleRate;
    const alpha = Math.sin(_m1) / (2 * _l1);
    const _n1 = Math.cos(_m1);
    const _o1 = 1 + alpha;
    const _61 = -2 * _n1;
    const _71 = 1 - alpha;
    const _81 = (1 + _n1) / 2;
    const _91 = -1 - _n1;
    const _a1 = (1 + _n1) / 2;
    this._61 = _61 / _o1;
    this._71 = _71 / _o1;
    this._81 = _81 / _o1;
    this._91 = _91 / _o1;
    this._a1 = _a1 / _o1;
    this._f1 = _k1;
    this._g1 = _l1;
  }
}
registerProcessor("hpf2-processor", _41);
class _p1 extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    const _51 = Math.min(sampleRate / 2.0, 20000.0);
    return [{
      name: "bypass",
      automationRate: "a-rate",
      defaultValue: 0,
      minValue: 0,
      maxValue: 1
    }, {
      name: "cutoff",
      automationRate: "a-rate",
      defaultValue: Math.min(500.0, _51),
      minValue: 10.0,
      maxValue: _51
    }, {
      name: "q",
      automationRate: "a-rate",
      defaultValue: 1.5,
      minValue: 1.0,
      maxValue: 100.0
    }];
  }
  constructor(_H) {
    super();
    this._r();
    const _I = _H.outputChannelCount[0];
    this._61 = 0;
    this._71 = 0;
    this._81 = 0;
    this._91 = 0;
    this._a1 = 0;
    this._b1 = new Float32Array(_I);
    this._c1 = new Float32Array(_I);
    this._d1 = new Float32Array(_I);
    this._e1 = new Float32Array(_I);
    this._f1 = -1;
    this._g1 = -1;
  }
  process(_v, _w, parameters) {
    const _x = _v[0];
    const _D = _w[0];
    const bypass = parameters.bypass;
    const cutoff = parameters.cutoff;
    const q = parameters.q;
    const _h1 = (cutoff.length === 1 && q.length === 1);
    if (_h1) this._i1(cutoff[0], q[0]);
    for (let c = 0; c < _x.length; ++c) {
      const _y = _x[c];
      const _E = _D[c];
      for (let _z = 0; _z < _y.length; ++_z) {
        if (!_h1) this._i1(cutoff[_z] ?? cutoff[0],
          q[_z] ?? q[0]);
        const _j1 = this._81 * _y[_z] + this._91 * this._b1[c] + this._a1 * this._c1[c] - this._61 * this._d1[c] - this._71 * this._e1[c];
        this._c1[c] = this._b1[c];
        this._b1[c] = _y[_z];
        this._e1[c] = this._d1[c];
        this._d1[c] = _j1;
        _E[_z] = (bypass[_z] ?? bypass[0]) ? _y[_z] : _j1;
      }
    }
    return this._s;
  }
  _i1(_k1, _l1) {
    if (_k1 === this._f1 && _l1 === this._g1) return;
    const _m1 = 2 * Math.PI * _k1 / sampleRate;
    const alpha = Math.sin(_m1) / (2 * _l1);
    const _n1 = Math.cos(_m1);
    const _o1 = 1 + alpha;
    const _61 = -2 * _n1;
    const _71 = 1 - alpha;
    const _81 = (1 - _n1) / 2;
    const _91 = 1 - _n1;
    const _a1 = (1 - _n1) / 2;
    this._61 = _61 / _o1;
    this._71 = _71 / _o1;
    this._81 = _81 / _o1;
    this._91 = _91 / _o1;
    this._a1 = _a1 / _o1;
    this._f1 = _k1;
    this._g1 = _l1;
  }
}
registerProcessor("lpf2-processor", _p1);
class _q1 {
  constructor(_r1) {
    this._s1 = 0;
    this._t1 = 0;
    this.feedback = 0;
    this._u1 = 0;
    this.buffer = new Float32Array(_r1);
    this._v1 = 0;
  }
  process(_21) {
    const out = this.buffer[this._v1];
    this._u1 = (this._u1 * this._s1) + (out * this._t1);
    this.buffer[this._v1] = _21 + (this._u1 * this.feedback);
    ++this._v1;
    this._v1 %= this.buffer.length;
    return out;
  }
  _w1(_x1) {
    this.feedback = Math.min(Math.max(0,
      _x1), 1);
  }
  _y1(_z1) {
    this._s1 = Math.min(Math.max(0, _z1), 1);
    this._t1 = 1 - this._s1;
  }
}
class _A1 {
  constructor(_r1) {
    this.feedback = 0;
    this.buffer = new Float32Array(_r1);
    this._v1 = 0;
  }
  process(_21) {
    const out = this.buffer[this._v1];
    this.buffer[this._v1] = _21 + (out * this.feedback);
    ++this._v1;
    this._v1 %= this.buffer.length;
    return (out - _21);
  }
  _w1(_x1) {
    this.feedback = Math.min(Math.max(0, _x1), 1);
  }
}
class _B1 extends AudioWorkletProcessor {
  static _C1 = 8;
  static _D1 = 4;
  static _E1 = 0.015;
  static _F1 = 0.4;
  static _G1 = 0.28;
  static _H1 = 0.7;
  static _I1 = [1116,
    1188, 1277, 1356, 1422, 1491, 1557, 1617
  ];
  static _J1 = [1139, 1211, 1300, 1379, 1445, 1514, 1580, 1640];
  static _K1 = [556, 441, 341, 225];
  static _L1 = [579, 464, 364, 248];
  static get parameterDescriptors() {
    return [{
      name: "bypass",
      automationRate: "a-rate",
      defaultValue: 0,
      minValue: 0,
      maxValue: 1
    }, {
      name: "size",
      automationRate: "a-rate",
      defaultValue: 0.7,
      minValue: 0.0,
      maxValue: 1.0
    }, {
      name: "damp",
      automationRate: "a-rate",
      defaultValue: 0.1,
      minValue: 0.0,
      maxValue: 1.0
    }, {
      name: "mix",
      automationRate: "a-rate",
      defaultValue: 0.35,
      minValue: 0.0,
      maxValue: 1.0
    }];
  }
  constructor(_H) {
    super();
    this._r();
    const _I = _H.outputChannelCount[0];
    this._M1 = -1;
    this._N1 = -1;
    this._O1 = new Array(_I);
    this._P1 = new Array(_I);
    const _Q1 = [_B1._I1, _B1._J1];
    const _R1 = [_B1._K1, _B1._L1];
    for (let c = 0; c < _I; ++c) {
      this._O1[c] = new Array(_B1._C1);
      this._P1[c] = new Array(_B1._D1);
      for (let i = 0; i < _B1._C1; ++i) this._O1[c][i] = new _q1(_Q1[c % _Q1.length][i]);
      for (let i = 0; i < _B1._D1; ++i) this._P1[c][i] = new _A1(_R1[c % _R1.length][i]);
    }
    this._S1(0.5);
    this._y1(0.5);
    for (let c = 0; c < _I; ++c)
      for (let i = 0; i < _B1._D1; ++i) this._P1[c][i]._w1(0.5);
  }
  process(_v, _w, parameters) {
    const _x = _v[0];
    const _D = _w[0];
    const bypass = parameters.bypass;
    const size = parameters.size;
    const damp = parameters.damp;
    const mix = parameters.mix;
    for (let c = 0; c < _x.length; ++c) {
      const _y = _x[c];
      const _E = _D[c];
      for (let _z = 0; _z < _y.length; ++_z) {
        this._S1(size[_z] ?? size[0]);
        this._y1(damp[_z] ?? damp[0]);
        _E[_z] = _y[_z];
        let out = 0;
        const _L = _y[_z] * _B1._E1;
        for (let i = 0; i < _B1._C1; ++i) out += this._O1[c][i].process(_L);
        for (let i = 0; i < _B1._D1; ++i) out = this._P1[c][i].process(out);
        if (bypass[_z] ?? bypass[0]) continue;
        const _O = (mix[_z] ?? mix[0]);
        _E[_z] *= (1 - _O);
        _E[_z] += (out * _O);
      }
    }
    return this._s;
  }
  _S1(_r1) {
    if (_r1 === this._M1) return;
    const size = (_r1 * _B1._G1) + _B1._H1;
    for (let c = 0; c < this._O1.length; ++c)
      for (let i = 0; i < _B1._C1; ++i) this._O1[c][i]._w1(size);
    this._M1 = _r1;
  }
  _y1(_z1) {
    if (_z1 === this._N1) return;
    const damp = _z1 * _B1._F1;
    for (let c = 0; c < this._O1.length; ++c)
      for (let i = 0; i < _B1._C1; ++i) this._O1[c][i]._y1(damp);
    this._N1 = _z1;
  }
}
registerProcessor("reverb1-processor", _B1);
class _T1 extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: "bypass",
      automationRate: "a-rate",
      defaultValue: 0,
      minValue: 0,
      maxValue: 1
    }, {
      name: "rate",
      automationRate: "a-rate",
      defaultValue: 5.0,
      minValue: 0.0,
      maxValue: 20.0
    }, {
      name: "intensity",
      automationRate: "a-rate",
      defaultValue: 1.0,
      minValue: 0.0,
      maxValue: 1.0
    }, {
      name: "offset",
      automationRate: "a-rate",
      defaultValue: 0.0,
      minValue: 0.0,
      maxValue: 1.0
    }, {
      name: "shape",
      automationRate: "a-rate",
      defaultValue: 0,
      minValue: 0,
      maxValue: 4
    }];
  }
  constructor(_H) {
    super();
    this._r();
    const _I = _H.outputChannelCount[0];
    this._U1 = new Array(_I).fill(1.0);
    this._V1 = new Array(_I).fill(0.0);
    this._W1 = new Array(_I).fill(_X1._Y1._Z1);
    this.__1 = new Array(_I);
    for (let c = 0; c < _I; ++c) {
      this.__1[c] = new _02();
      this.__1[c]._12(sampleRate);
      this.__1[c]._22(this._U1[c]);
      this.__1[c]._32(this._W1[c]);
      if (c % 2 === 1) {
        this.__1[c]._42(this._V1[c]);
      }
    }
  }
  process(_v, _w, parameters) {
    const _x = _v[0];
    const _D = _w[0];
    const bypass = parameters.bypass;
    const rate = parameters.rate;
    const intensity = parameters.intensity;
    const offset = parameters.offset;
    const shape = parameters.shape;
    for (let c = 0; c < _x.length; ++c) {
      const _y = _x[c];
      const _E = _D[c];
      for (let _z = 0; _z < _y.length; ++_z) {
        _E[_z] = _y[_z];
        const _N = rate[_z] ?? rate[0];
        const _52 = offset[_z] ?? offset[0];
        const _62 = shape[_z] ?? shape[0];
        this._72(c, _N, _52, _62);
        const _82 = this.__1[c]._U();
        if ((bypass[_z] ?? bypass[0]) > 0.0) {
          continue;
        }
        const i = intensity[_z] ?? intensity[0];
        const out = _y[_z] * _82 * i;
        _E[_z] *= (1.0 - i);
        _E[_z] += out;
      }
    }
    return this._s;
  }
  _72(_W, _92, _a2, _b2) {
    if (_92 !== this._U1[_W]) {
      this.__1[_W]._22(_92);
      this._U1[_W] = _92;
    }
    if (_a2 !== this._V1[_W]) {
      if (_W % 2 === 1) {
        this.__1[_W]._42(_a2);
      }
      this._V1[_W] = _a2;
    }
    if (_b2 !== this._W1[_W]) {
      this.__1[_W]._32(_b2);
      this._W1[_W] = _b2;
    }
  }
}
registerProcessor("tremolo-processor", _T1);

function _X1() {}
_X1._Y1 = {
  _Z1: 0,
  _c2: 1,
  _d2: 2,
  _e2: 3,
  _f2: 4,
  _g2: 5
};
_X1._h2 = function(_i2) {
  return 1.0 - _i2;
};
_X1._j2 = function(_i2) {
  return _i2;
};
_X1._k2 = function(_i2) {
  return 0.5 * (Math.sin((_i2 * 2.0 * Math.PI) - (Math.PI / 2.0)) + 1.0);
};
_X1._l2 = function(_i2) {
  if (_i2 < 0.5) {
    return 0.0;
  }
  return 1.0;
};
_X1._m2 = function(_i2) {
  if (_i2 < 0.5) {
    return 2.0 * _i2;
  }
  return 2.0 - (2.0 * _i2);
};
_X1._n2 = [_X1._h2, _X1._j2, _X1._k2, _X1._l2, _X1._m2];
_o2._p2 = 512;
_o2._q2 = 1.0 / _o2._p2;

function _o2(_r2) {
  this.data = new Float32Array(_o2._p2);
  for (let i = 0; i < _o2._p2; ++i) {
    this.data[i] = _r2(i * _o2._q2);
  }
}
_o2.prototype._U = function(_i2) {
  _i2 = Math.max(0.0, _i2);
  _i2 = Math.min(_i2, 1.0);
  const _s2 = _i2 * _o2._p2;
  const _t2 = ~~_s2;
  const _u2 = _s2 - _t2;
  let _Z = _t2;
  let __ = _Z + 1;
  if (_Z >= _o2._p2) {
    _Z -= _o2._p2;
  }
  if (__ >= _o2._p2) {
    __ -= _o2._p2;
  }
  const _01 = this.data[_Z];
  const _11 = this.data[__];
  return _01 + (_11 - _01) * _u2;
};
_02._v2 = [];
_02._w2 = false;
_02._x2 = 0.0;
_02._y2 = 20.0;

function _02() {
  this._z2 = 48000;
  this.shape = _X1._Y1._d2;
  this._A2 = 1.0;
  this._B2 = 0.0;
  this._q2 = 0.0;
  this._C2 = 0.0;
  if (_02._w2 == true) {
    return;
  }
  for (let i = 0; i < _X1._Y1._g2; ++i) {
    _02._v2[i] = new _o2(_X1._n2[i]);
  }
  _02._w2 = true;
}
_02._D2 = function() {
  return (_02._w2 == true);
};
_02.prototype._12 = function(_E2) {
  this._z2 = _E2;
  this._F2();
};
_02.prototype._22 = function(_G2) {
  _G2 = Math.max(_02._x2, _G2);
  _G2 = Math.min(_G2, _02._y2);
  this._A2 = _G2;
  this._F2();
};
_02.prototype._42 = function(_a2) {
  _a2 = Math.max(0.0, _a2);
  _a2 = Math.min(_a2, 1.0);
  const _H2 = _a2 - this._C2;
  this._C2 = _a2;
  this._B2 += _H2;
  while (this._B2 >= 1.0) {
    this._B2 -= 1.0;
  }
  while (this._B2 < 0.0) {
    this._B2 += 1.0;
  }
};
_02.prototype._32 = function(_b2) {
  _b2 = Math.max(0, _b2);
  _b2 = Math.min(_b2, _X1._Y1._g2 - 1);
  this.shape = _b2;
};
_02.prototype._U = function() {
  const result = _02._v2[this.shape]._U(this._B2);
  this._B2 += this._q2;
  while (this._B2 >= 1.0) {
    this._B2 -= 1.0;
  }
  return result;
};
_02.prototype._F2 = function() {
  this._q2 = this._A2 / this._z2;
};