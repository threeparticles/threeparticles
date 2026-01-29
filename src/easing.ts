/**
 * TSL easing functions for WebGPU based particle animation.
 * All functions take a progress value t (0-1) and return the eased value.
 * @module
 */
// @ts-nocheck - TSL types are incompatible with TypeScript
import { PI, float, mul, sub, pow, add, cos, sin, sqrt, select, Fn, If, Switch } from "three/tsl";

// Linear
export const easeLinear = /*@__PURE__*/ Fn(([t]) => t, {
  t: "float",
  return: "float",
});

// Power 1
export const easeInPower1 = /*@__PURE__*/ Fn(([t]) => t, {
  t: "float",
  return: "float",
});
export const easeOutPower1 = /*@__PURE__*/ Fn(([t]) => sub(1.0, sub(1.0, t)), {
  t: "float",
  return: "float",
});
export const easeInOutPower1 = /*@__PURE__*/ Fn(([t]) => t, {
  t: "float",
  return: "float",
});

// Power 2
export const easeInPower2 = /*@__PURE__*/ Fn(([t]) => t.mul(t), {
  t: "float",
  return: "float",
});
export const easeOutPower2 = /*@__PURE__*/ Fn(([t]) => sub(1.0, pow(sub(1.0, t), 2.0)), {
  t: "float",
  return: "float",
});
export const easeInOutPower2 = /*@__PURE__*/ Fn(
  ([t]) =>
    select(
      t.lessThan(0.5),
      mul(2.0, t).mul(t),
      sub(1.0, pow(float(-2.0).mul(t).add(2.0), 2.0).div(2.0)),
    ),
  { t: "float", return: "float" },
);

// Power 3
export const easeInPower3 = /*@__PURE__*/ Fn(([t]) => t.mul(t).mul(t), {
  t: "float",
  return: "float",
});
export const easeOutPower3 = /*@__PURE__*/ Fn(([t]) => sub(1.0, pow(sub(1.0, t), 3.0)), {
  t: "float",
  return: "float",
});
export const easeInOutPower3 = /*@__PURE__*/ Fn(
  ([t]) =>
    select(
      t.lessThan(0.5),
      mul(4.0, t).mul(t).mul(t),
      sub(1.0, pow(float(-2.0).mul(t).add(2.0), 3.0).div(2.0)),
    ),
  { t: "float", return: "float" },
);

// Power 4
export const easeInPower4 = /*@__PURE__*/ Fn(([t]) => t.mul(t).mul(t).mul(t), {
  t: "float",
  return: "float",
});
export const easeOutPower4 = /*@__PURE__*/ Fn(([t]) => sub(1.0, pow(sub(1.0, t), 4.0)), {
  t: "float",
  return: "float",
});
export const easeInOutPower4 = /*@__PURE__*/ Fn(
  ([t]) =>
    select(
      t.lessThan(0.5),
      mul(8.0, t).mul(t).mul(t).mul(t),
      sub(1.0, pow(float(-2.0).mul(t).add(2.0), 4.0).div(2.0)),
    ),
  { t: "float", return: "float" },
);

// Quad
export const easeInQuad = /*@__PURE__*/ Fn(([t]) => t.mul(t), {
  t: "float",
  return: "float",
});
export const easeOutQuad = /*@__PURE__*/ Fn(([t]) => t.mul(sub(2.0, t)), {
  t: "float",
  return: "float",
});
export const easeInOutQuad = /*@__PURE__*/ Fn(
  ([t]) =>
    select(t.lessThan(0.5), mul(2.0, t).mul(t), float(-1.0).add(sub(4.0, mul(2.0, t)).mul(t))),
  { t: "float", return: "float" },
);

// Cubic
export const easeInCubic = /*@__PURE__*/ Fn(([t]) => t.mul(t).mul(t), {
  t: "float",
  return: "float",
});
export const easeOutCubic = /*@__PURE__*/ Fn(
  ([t]) => {
    const t1 = t.sub(1.0);
    return add(1.0, t1.mul(t1).mul(t1));
  },
  { t: "float", return: "float" },
);
export const easeInOutCubic = /*@__PURE__*/ Fn(
  ([t]) =>
    select(
      t.lessThan(0.5),
      mul(4.0, t).mul(t).mul(t),
      t.sub(1.0).mul(mul(2.0, t).sub(2.0)).mul(mul(2.0, t).sub(2.0)).add(1.0),
    ),
  { t: "float", return: "float" },
);

// Quart
export const easeInQuart = /*@__PURE__*/ Fn(([t]) => t.mul(t).mul(t).mul(t), {
  t: "float",
  return: "float",
});
export const easeOutQuart = /*@__PURE__*/ Fn(
  ([t]) => {
    const t1 = t.sub(1.0);
    return sub(1.0, t1.mul(t1).mul(t1).mul(t1));
  },
  { t: "float", return: "float" },
);
export const easeInOutQuart = /*@__PURE__*/ Fn(
  ([t]) => {
    const t1 = t.sub(1.0);
    return select(
      t.lessThan(0.5),
      mul(8.0, t).mul(t).mul(t).mul(t),
      sub(1.0, mul(8.0, t1).mul(t1).mul(t1).mul(t1)),
    );
  },
  { t: "float", return: "float" },
);

// Quint
export const easeInQuint = /*@__PURE__*/ Fn(([t]) => t.mul(t).mul(t).mul(t).mul(t), {
  t: "float",
  return: "float",
});
export const easeOutQuint = /*@__PURE__*/ Fn(
  ([t]) => {
    const t1 = t.sub(1.0);
    return add(1.0, t1.mul(t1).mul(t1).mul(t1).mul(t1));
  },
  { t: "float", return: "float" },
);
export const easeInOutQuint = /*@__PURE__*/ Fn(
  ([t]) => {
    const t1 = t.sub(1.0);
    return select(
      t.lessThan(0.5),
      mul(16.0, t).mul(t).mul(t).mul(t).mul(t),
      add(1.0, mul(16.0, t1).mul(t1).mul(t1).mul(t1).mul(t1)),
    );
  },
  { t: "float", return: "float" },
);

// Sine
export const easeInSine = /*@__PURE__*/ Fn(
  ([t]) =>
    float(-1.0)
      .mul(cos(t.mul(PI).mul(0.5)))
      .add(1.0),
  { t: "float", return: "float" },
);
export const easeOutSine = /*@__PURE__*/ Fn(([t]) => sin(t.mul(PI).mul(0.5)), {
  t: "float",
  return: "float",
});
export const easeInOutSine = /*@__PURE__*/ Fn(([t]) => float(-0.5).mul(cos(PI.mul(t)).sub(1.0)), {
  t: "float",
  return: "float",
});

// Expo
export const easeInExpo = /*@__PURE__*/ Fn(
  ([t]) => select(t.equal(0.0), 0.0, pow(2.0, mul(10.0, t.sub(1.0)))),
  { t: "float", return: "float" },
);
export const easeOutExpo = /*@__PURE__*/ Fn(
  ([t]) => select(t.equal(1.0), 1.0, sub(1.0, pow(2.0, float(-10.0).mul(t)))),
  { t: "float", return: "float" },
);
export const easeInOutExpo = /*@__PURE__*/ Fn(
  ([t]) => {
    If(t.equal(0.0).or(t.equal(1.0)), () => t);
    return select(
      t.lessThan(0.5),
      mul(0.5, pow(2.0, mul(20.0, t).sub(10.0))),
      mul(0.5, pow(2.0, float(-20.0).mul(t).add(10.0)).negate().add(2.0)),
    );
  },
  { t: "float", return: "float" },
);

// Circ
export const easeInCirc = /*@__PURE__*/ Fn(
  ([t]) => float(-1.0).mul(sqrt(sub(1.0, t.mul(t))).sub(1.0)),
  { t: "float", return: "float" },
);
export const easeOutCirc = /*@__PURE__*/ Fn(
  ([t]) => {
    const t1 = t.sub(1.0);
    return sqrt(sub(1.0, t1.mul(t1)));
  },
  { t: "float", return: "float" },
);
export const easeInOutCirc = /*@__PURE__*/ Fn(
  ([t]) => {
    const t1 = mul(2.0, t);
    const t2 = t1.sub(2.0);
    return select(
      t.lessThan(0.5),
      float(-0.5).mul(sqrt(sub(1.0, t1.mul(t1))).sub(1.0)),
      mul(0.5, sqrt(sub(1.0, t2.mul(t2))).add(1.0)),
    );
  },
  { t: "float", return: "float" },
);

// Elastic
export const easeInElastic = /*@__PURE__*/ Fn(
  ([t]) => {
    If(t.equal(0.0).or(t.equal(1.0)), () => t);
    return pow(2.0, mul(10.0, t.sub(1.0)))
      .negate()
      .mul(sin(t.sub(1.075).mul(mul(2.0, PI)).div(0.3)));
  },
  { t: "float", return: "float" },
);
export const easeOutElastic = /*@__PURE__*/ Fn(
  ([t]) => {
    If(t.equal(0.0).or(t.equal(1.0)), () => t);
    return pow(2.0, float(-10.0).mul(t))
      .mul(sin(t.sub(0.075).mul(mul(2.0, PI)).div(0.3)))
      .add(1.0);
  },
  { t: "float", return: "float" },
);
export const easeInOutElastic = /*@__PURE__*/ Fn(
  ([t]) => {
    If(t.lessThan(0.5), () =>
      float(-0.5)
        .mul(pow(2.0, mul(20.0, t).sub(10.0)))
        .mul(sin(mul(20.0, t).sub(11.125).mul(mul(2.0, PI)).div(4.5))),
    );
    return pow(2.0, float(-20.0).mul(t).add(10.0))
      .mul(sin(mul(20.0, t).sub(11.125).mul(mul(2.0, PI)).div(4.5)))
      .mul(0.5)
      .add(1.0);
  },
  { t: "float", return: "float" },
);

// Back
export const easeInBack = /*@__PURE__*/ Fn(
  ([t]) => {
    const s = float(1.70158);
    return t.mul(t).mul(s.add(1.0).mul(t).sub(s));
  },
  { t: "float", return: "float" },
);
export const easeOutBack = /*@__PURE__*/ Fn(
  ([t]) => {
    const s = float(1.70158);
    const t1 = t.sub(1.0);
    return t1.mul(t1).mul(s.add(1.0).mul(t1).add(s)).add(1.0);
  },
  { t: "float", return: "float" },
);
export const easeInOutBack = /*@__PURE__*/ Fn(
  ([t_immutable]) => {
    const t = t_immutable.toVar();
    const s = float(1.70158 * 1.525);
    t.mulAssign(2.0);
    If(t.lessThan(1.0), () => mul(0.5, t.mul(t).mul(s.add(1.0).mul(t).sub(s))));
    t.subAssign(2.0);
    return mul(0.5, t.mul(t).mul(s.add(1.0).mul(t).add(s)).add(2.0));
  },
  { t: "float", return: "float" },
);

// Bounce
export const easeOutBounce = /*@__PURE__*/ Fn(
  ([t_immutable]) => {
    const t = t_immutable.toVar();
    If(t.lessThan(1.0 / 2.75), () => mul(7.5625, t).mul(t))
      .ElseIf(t.lessThan(2.0 / 2.75), () => {
        t.subAssign(1.5 / 2.75);
        return mul(7.5625, t).mul(t).add(0.75);
      })
      .ElseIf(t.lessThan(2.5 / 2.75), () => {
        t.subAssign(2.25 / 2.75);
        return mul(7.5625, t).mul(t).add(0.9375);
      })
      .Else(() => {
        t.subAssign(2.625 / 2.75);
        return mul(7.5625, t).mul(t).add(0.984375);
      });
  },
  { t: "float", return: "float" },
);
export const easeInBounce = /*@__PURE__*/ Fn(([t]) => sub(1.0, easeOutBounce(sub(1.0, t))), {
  t: "float",
  return: "float",
});
export const easeInOutBounce = /*@__PURE__*/ Fn(
  ([t]) =>
    select(
      t.lessThan(0.5),
      sub(1.0, easeOutBounce(sub(1.0, mul(2.0, t)))).mul(0.5),
      add(1.0, easeOutBounce(mul(2.0, t).sub(1.0))).mul(0.5),
    ),
  { t: "float", return: "float" },
);

/**
 * Applies an easing function based on its index in EASE_FUNCTIONS array.
 * Used by the particle shader to select the correct easing at runtime.
 *
 * @param t - Progress value from 0 to 1
 * @param easingId - Index of the easing function in EASE_FUNCTIONS
 * @returns Eased progress value
 */
export const applyEasing = /*@__PURE__*/ Fn(
  ([t, easingId]) => {
    Switch(easingId)
      .Case(0, () => easeLinear(t))
      .Case(1, () => easeInPower1(t))
      .Case(2, () => easeOutPower1(t))
      .Case(3, () => easeInOutPower1(t))
      .Case(4, () => easeInPower2(t))
      .Case(5, () => easeOutPower2(t))
      .Case(6, () => easeInOutPower2(t))
      .Case(7, () => easeInPower3(t))
      .Case(8, () => easeOutPower3(t))
      .Case(9, () => easeInOutPower3(t))
      .Case(10, () => easeInPower4(t))
      .Case(11, () => easeOutPower4(t))
      .Case(12, () => easeInOutPower4(t))
      .Case(13, () => easeInQuad(t))
      .Case(14, () => easeOutQuad(t))
      .Case(15, () => easeInOutQuad(t))
      .Case(16, () => easeInCubic(t))
      .Case(17, () => easeOutCubic(t))
      .Case(18, () => easeInOutCubic(t))
      .Case(19, () => easeInQuart(t))
      .Case(20, () => easeOutQuart(t))
      .Case(21, () => easeInOutQuart(t))
      .Case(22, () => easeInQuint(t))
      .Case(23, () => easeOutQuint(t))
      .Case(24, () => easeInOutQuint(t))
      .Case(25, () => easeInSine(t))
      .Case(26, () => easeOutSine(t))
      .Case(27, () => easeInOutSine(t))
      .Case(28, () => easeInExpo(t))
      .Case(29, () => easeOutExpo(t))
      .Case(30, () => easeInOutExpo(t))
      .Case(31, () => easeInCirc(t))
      .Case(32, () => easeOutCirc(t))
      .Case(33, () => easeInOutCirc(t))
      .Case(34, () => easeInElastic(t))
      .Case(35, () => easeOutElastic(t))
      .Case(36, () => easeInOutElastic(t))
      .Case(37, () => easeInBack(t))
      .Case(38, () => easeOutBack(t))
      .Case(39, () => easeInOutBack(t));
    return t;
  },
  { t: "float", easingId: "int", return: "float" },
);
