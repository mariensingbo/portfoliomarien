import * as MathUtils from './MathUtils.js'

export const MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 }
export const TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }

class EventDispatcher {
  addEventListener(type, listener) {
    if (this._listeners === undefined) this._listeners = {}

    const listeners = this._listeners

    if (listeners[type] === undefined) {
      listeners[type] = []
    }

    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener)
    }
  }

  hasEventListener(type, listener) {
    if (this._listeners === undefined) return false

    const listeners = this._listeners

    return listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1
  }

  removeEventListener(type, listener) {
    if (this._listeners === undefined) return

    const listeners = this._listeners
    const listenerArray = listeners[type]

    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener)

      if (index !== -1) {
        listenerArray.splice(index, 1)
      }
    }
  }

  dispatchEvent(event) {
    if (this._listeners === undefined) return

    const listeners = this._listeners
    const listenerArray = listeners[event.type]

    if (listenerArray !== undefined) {
      event.target = this

      // Make a copy, in case listeners are removed while iterating.
      const array = listenerArray.slice(0)

      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, event)
      }

      event.target = null
    }
  }
}

export { EventDispatcher }

class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.isQuaternion = true

    this._x = x
    this._y = y
    this._z = z
    this._w = w
  }

  static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
    // fuzz-free, array-based Quaternion SLERP operation

    let x0 = src0[srcOffset0 + 0],
      y0 = src0[srcOffset0 + 1],
      z0 = src0[srcOffset0 + 2],
      w0 = src0[srcOffset0 + 3]

    const x1 = src1[srcOffset1 + 0],
      y1 = src1[srcOffset1 + 1],
      z1 = src1[srcOffset1 + 2],
      w1 = src1[srcOffset1 + 3]

    if (t === 0) {
      dst[dstOffset + 0] = x0
      dst[dstOffset + 1] = y0
      dst[dstOffset + 2] = z0
      dst[dstOffset + 3] = w0
      return
    }

    if (t === 1) {
      dst[dstOffset + 0] = x1
      dst[dstOffset + 1] = y1
      dst[dstOffset + 2] = z1
      dst[dstOffset + 3] = w1
      return
    }

    if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
      let s = 1 - t
      const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
        dir = cos >= 0 ? 1 : -1,
        sqrSin = 1 - cos * cos

      // Skip the Slerp for tiny steps to avoid numeric problems:
      if (sqrSin > Number.EPSILON) {
        const sin = Math.sqrt(sqrSin),
          len = Math.atan2(sin, cos * dir)

        s = Math.sin(s * len) / sin
        t = Math.sin(t * len) / sin
      }

      const tDir = t * dir

      x0 = x0 * s + x1 * tDir
      y0 = y0 * s + y1 * tDir
      z0 = z0 * s + z1 * tDir
      w0 = w0 * s + w1 * tDir

      // Normalize in case we just did a lerp:
      if (s === 1 - t) {
        const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0)

        x0 *= f
        y0 *= f
        z0 *= f
        w0 *= f
      }
    }

    dst[dstOffset] = x0
    dst[dstOffset + 1] = y0
    dst[dstOffset + 2] = z0
    dst[dstOffset + 3] = w0
  }

  static multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
    const x0 = src0[srcOffset0]
    const y0 = src0[srcOffset0 + 1]
    const z0 = src0[srcOffset0 + 2]
    const w0 = src0[srcOffset0 + 3]

    const x1 = src1[srcOffset1]
    const y1 = src1[srcOffset1 + 1]
    const z1 = src1[srcOffset1 + 2]
    const w1 = src1[srcOffset1 + 3]

    dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1
    dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1
    dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1
    dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1

    return dst
  }

  get x() {
    return this._x
  }

  set x(value) {
    this._x = value
    this._onChangeCallback()
  }

  get y() {
    return this._y
  }

  set y(value) {
    this._y = value
    this._onChangeCallback()
  }

  get z() {
    return this._z
  }

  set z(value) {
    this._z = value
    this._onChangeCallback()
  }

  get w() {
    return this._w
  }

  set w(value) {
    this._w = value
    this._onChangeCallback()
  }

  set(x, y, z, w) {
    this._x = x
    this._y = y
    this._z = z
    this._w = w

    this._onChangeCallback()

    return this
  }

  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w)
  }

  copy(quaternion) {
    this._x = quaternion.x
    this._y = quaternion.y
    this._z = quaternion.z
    this._w = quaternion.w

    this._onChangeCallback()

    return this
  }

  setFromEuler(euler, update) {
    const x = euler._x,
      y = euler._y,
      z = euler._z,
      order = euler._order

    // http://www.mathworks.com/matlabcentral/fileexchange/
    // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
    //	content/SpinCalc.m

    const cos = Math.cos
    const sin = Math.sin

    const c1 = cos(x / 2)
    const c2 = cos(y / 2)
    const c3 = cos(z / 2)

    const s1 = sin(x / 2)
    const s2 = sin(y / 2)
    const s3 = sin(z / 2)

    switch (order) {
      case 'XYZ':
        this._x = s1 * c2 * c3 + c1 * s2 * s3
        this._y = c1 * s2 * c3 - s1 * c2 * s3
        this._z = c1 * c2 * s3 + s1 * s2 * c3
        this._w = c1 * c2 * c3 - s1 * s2 * s3
        break

      case 'YXZ':
        this._x = s1 * c2 * c3 + c1 * s2 * s3
        this._y = c1 * s2 * c3 - s1 * c2 * s3
        this._z = c1 * c2 * s3 - s1 * s2 * c3
        this._w = c1 * c2 * c3 + s1 * s2 * s3
        break

      case 'ZXY':
        this._x = s1 * c2 * c3 - c1 * s2 * s3
        this._y = c1 * s2 * c3 + s1 * c2 * s3
        this._z = c1 * c2 * s3 + s1 * s2 * c3
        this._w = c1 * c2 * c3 - s1 * s2 * s3
        break

      case 'ZYX':
        this._x = s1 * c2 * c3 - c1 * s2 * s3
        this._y = c1 * s2 * c3 + s1 * c2 * s3
        this._z = c1 * c2 * s3 - s1 * s2 * c3
        this._w = c1 * c2 * c3 + s1 * s2 * s3
        break

      case 'YZX':
        this._x = s1 * c2 * c3 + c1 * s2 * s3
        this._y = c1 * s2 * c3 + s1 * c2 * s3
        this._z = c1 * c2 * s3 - s1 * s2 * c3
        this._w = c1 * c2 * c3 - s1 * s2 * s3
        break

      case 'XZY':
        this._x = s1 * c2 * c3 - c1 * s2 * s3
        this._y = c1 * s2 * c3 - s1 * c2 * s3
        this._z = c1 * c2 * s3 + s1 * s2 * c3
        this._w = c1 * c2 * c3 + s1 * s2 * s3
        break

      default:
        console.warn('THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order)
    }

    if (update !== false) this._onChangeCallback()

    return this
  }

  setFromAxisAngle(axis, angle) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

    // assumes axis is normalized

    const halfAngle = angle / 2,
      s = Math.sin(halfAngle)

    this._x = axis.x * s
    this._y = axis.y * s
    this._z = axis.z * s
    this._w = Math.cos(halfAngle)

    this._onChangeCallback()

    return this
  }

  setFromRotationMatrix(m) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    const te = m.elements,
      m11 = te[0],
      m12 = te[4],
      m13 = te[8],
      m21 = te[1],
      m22 = te[5],
      m23 = te[9],
      m31 = te[2],
      m32 = te[6],
      m33 = te[10],
      trace = m11 + m22 + m33

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1.0)

      this._w = 0.25 / s
      this._x = (m32 - m23) * s
      this._y = (m13 - m31) * s
      this._z = (m21 - m12) * s
    } else if (m11 > m22 && m11 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33)

      this._w = (m32 - m23) / s
      this._x = 0.25 * s
      this._y = (m12 + m21) / s
      this._z = (m13 + m31) / s
    } else if (m22 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33)

      this._w = (m13 - m31) / s
      this._x = (m12 + m21) / s
      this._y = 0.25 * s
      this._z = (m23 + m32) / s
    } else {
      const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22)

      this._w = (m21 - m12) / s
      this._x = (m13 + m31) / s
      this._y = (m23 + m32) / s
      this._z = 0.25 * s
    }

    this._onChangeCallback()

    return this
  }

  setFromUnitVectors(vFrom, vTo) {
    // assumes direction vectors vFrom and vTo are normalized

    let r = vFrom.dot(vTo) + 1

    if (r < Number.EPSILON) {
      // vFrom and vTo point in opposite directions

      r = 0

      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        this._x = -vFrom.y
        this._y = vFrom.x
        this._z = 0
        this._w = r
      } else {
        this._x = 0
        this._y = -vFrom.z
        this._z = vFrom.y
        this._w = r
      }
    } else {
      // crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

      this._x = vFrom.y * vTo.z - vFrom.z * vTo.y
      this._y = vFrom.z * vTo.x - vFrom.x * vTo.z
      this._z = vFrom.x * vTo.y - vFrom.y * vTo.x
      this._w = r
    }

    return this.normalize()
  }

  angleTo(q) {
    return 2 * Math.acos(Math.abs(MathUtils.clamp(this.dot(q), -1, 1)))
  }

  rotateTowards(q, step) {
    const angle = this.angleTo(q)

    if (angle === 0) return this

    const t = Math.min(1, step / angle)

    this.slerp(q, t)

    return this
  }

  identity() {
    return this.set(0, 0, 0, 1)
  }

  invert() {
    // quaternion is assumed to have unit length

    return this.conjugate()
  }

  conjugate() {
    this._x *= -1
    this._y *= -1
    this._z *= -1

    this._onChangeCallback()

    return this
  }

  dot(v) {
    return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w
  }

  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w
  }

  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w)
  }

  normalize() {
    let l = this.length()

    if (l === 0) {
      this._x = 0
      this._y = 0
      this._z = 0
      this._w = 1
    } else {
      l = 1 / l

      this._x = this._x * l
      this._y = this._y * l
      this._z = this._z * l
      this._w = this._w * l
    }

    this._onChangeCallback()

    return this
  }

  multiply(q) {
    return this.multiplyQuaternions(this, q)
  }

  premultiply(q) {
    return this.multiplyQuaternions(q, this)
  }

  multiplyQuaternions(a, b) {
    // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

    const qax = a._x,
      qay = a._y,
      qaz = a._z,
      qaw = a._w
    const qbx = b._x,
      qby = b._y,
      qbz = b._z,
      qbw = b._w

    this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby
    this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz
    this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx
    this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz

    this._onChangeCallback()

    return this
  }

  slerp(qb, t) {
    if (t === 0) return this
    if (t === 1) return this.copy(qb)

    const x = this._x,
      y = this._y,
      z = this._z,
      w = this._w

    // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

    let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z

    if (cosHalfTheta < 0) {
      this._w = -qb._w
      this._x = -qb._x
      this._y = -qb._y
      this._z = -qb._z

      cosHalfTheta = -cosHalfTheta
    } else {
      this.copy(qb)
    }

    if (cosHalfTheta >= 1.0) {
      this._w = w
      this._x = x
      this._y = y
      this._z = z

      return this
    }

    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta

    if (sqrSinHalfTheta <= Number.EPSILON) {
      const s = 1 - t
      this._w = s * w + t * this._w
      this._x = s * x + t * this._x
      this._y = s * y + t * this._y
      this._z = s * z + t * this._z

      this.normalize()
      this._onChangeCallback()

      return this
    }

    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta)
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta)
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
      ratioB = Math.sin(t * halfTheta) / sinHalfTheta

    this._w = w * ratioA + this._w * ratioB
    this._x = x * ratioA + this._x * ratioB
    this._y = y * ratioA + this._y * ratioB
    this._z = z * ratioA + this._z * ratioB

    this._onChangeCallback()

    return this
  }

  slerpQuaternions(qa, qb, t) {
    return this.copy(qa).slerp(qb, t)
  }

  random() {
    // Derived from http://planning.cs.uiuc.edu/node198.html
    // Note, this source uses w, x, y, z ordering,
    // so we swap the order below.

    const u1 = Math.random()
    const sqrt1u1 = Math.sqrt(1 - u1)
    const sqrtu1 = Math.sqrt(u1)

    const u2 = 2 * Math.PI * Math.random()

    const u3 = 2 * Math.PI * Math.random()

    return this.set(
      sqrt1u1 * Math.cos(u2),
      sqrtu1 * Math.sin(u3),
      sqrtu1 * Math.cos(u3),
      sqrt1u1 * Math.sin(u2)
    )
  }

  equals(quaternion) {
    return (
      quaternion._x === this._x &&
      quaternion._y === this._y &&
      quaternion._z === this._z &&
      quaternion._w === this._w
    )
  }

  fromArray(array, offset = 0) {
    this._x = array[offset]
    this._y = array[offset + 1]
    this._z = array[offset + 2]
    this._w = array[offset + 3]

    this._onChangeCallback()

    return this
  }

  toArray(array = [], offset = 0) {
    array[offset] = this._x
    array[offset + 1] = this._y
    array[offset + 2] = this._z
    array[offset + 3] = this._w

    return array
  }

  fromBufferAttribute(attribute, index) {
    this._x = attribute.getX(index)
    this._y = attribute.getY(index)
    this._z = attribute.getZ(index)
    this._w = attribute.getW(index)

    return this
  }

  _onChange(callback) {
    this._onChangeCallback = callback

    return this
  }

  _onChangeCallback() {}

  *[Symbol.iterator]() {
    yield this._x
    yield this._y
    yield this._z
    yield this._w
  }
}

export { Quaternion }

class Vector2 {
  constructor(x = 0, y = 0) {
    Vector2.prototype.isVector2 = true

    this.x = x
    this.y = y
  }

  get width() {
    return this.x
  }

  set width(value) {
    this.x = value
  }

  get height() {
    return this.y
  }

  set height(value) {
    this.y = value
  }

  set(x, y) {
    this.x = x
    this.y = y

    return this
  }

  setScalar(scalar) {
    this.x = scalar
    this.y = scalar

    return this
  }

  setX(x) {
    this.x = x

    return this
  }

  setY(y) {
    this.y = y

    return this
  }

  setComponent(index, value) {
    switch (index) {
      case 0:
        this.x = value
        break
      case 1:
        this.y = value
        break
      default:
        throw new Error('index is out of range: ' + index)
    }

    return this
  }

  getComponent(index) {
    switch (index) {
      case 0:
        return this.x
      case 1:
        return this.y
      default:
        throw new Error('index is out of range: ' + index)
    }
  }

  clone() {
    return new this.constructor(this.x, this.y)
  }

  copy(v) {
    this.x = v.x
    this.y = v.y

    return this
  }

  add(v) {
    this.x += v.x
    this.y += v.y

    return this
  }

  addScalar(s) {
    this.x += s
    this.y += s

    return this
  }

  addVectors(a, b) {
    this.x = a.x + b.x
    this.y = a.y + b.y

    return this
  }

  addScaledVector(v, s) {
    this.x += v.x * s
    this.y += v.y * s

    return this
  }

  sub(v) {
    this.x -= v.x
    this.y -= v.y

    return this
  }

  subScalar(s) {
    this.x -= s
    this.y -= s

    return this
  }

  subVectors(a, b) {
    this.x = a.x - b.x
    this.y = a.y - b.y

    return this
  }

  multiply(v) {
    this.x *= v.x
    this.y *= v.y

    return this
  }

  multiplyScalar(scalar) {
    this.x *= scalar
    this.y *= scalar

    return this
  }

  divide(v) {
    this.x /= v.x
    this.y /= v.y

    return this
  }

  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar)
  }

  applyMatrix3(m) {
    const x = this.x,
      y = this.y
    const e = m.elements

    this.x = e[0] * x + e[3] * y + e[6]
    this.y = e[1] * x + e[4] * y + e[7]

    return this
  }

  min(v) {
    this.x = Math.min(this.x, v.x)
    this.y = Math.min(this.y, v.y)

    return this
  }

  max(v) {
    this.x = Math.max(this.x, v.x)
    this.y = Math.max(this.y, v.y)

    return this
  }

  clamp(min, max) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x))
    this.y = Math.max(min.y, Math.min(max.y, this.y))

    return this
  }

  clampScalar(minVal, maxVal) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x))
    this.y = Math.max(minVal, Math.min(maxVal, this.y))

    return this
  }

  clampLength(min, max) {
    const length = this.length()

    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)))
  }

  floor() {
    this.x = Math.floor(this.x)
    this.y = Math.floor(this.y)

    return this
  }

  ceil() {
    this.x = Math.ceil(this.x)
    this.y = Math.ceil(this.y)

    return this
  }

  round() {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)

    return this
  }

  roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x)
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y)

    return this
  }

  negate() {
    this.x = -this.x
    this.y = -this.y

    return this
  }

  dot(v) {
    return this.x * v.x + this.y * v.y
  }

  cross(v) {
    return this.x * v.y - this.y * v.x
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y)
  }

  normalize() {
    return this.divideScalar(this.length() || 1)
  }

  angle() {
    // computes the angle in radians with respect to the positive x-axis

    const angle = Math.atan2(-this.y, -this.x) + Math.PI

    return angle
  }

  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v))
  }

  distanceToSquared(v) {
    const dx = this.x - v.x,
      dy = this.y - v.y
    return dx * dx + dy * dy
  }

  manhattanDistanceTo(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y)
  }

  setLength(length) {
    return this.normalize().multiplyScalar(length)
  }

  lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha
    this.y += (v.y - this.y) * alpha

    return this
  }

  lerpVectors(v1, v2, alpha) {
    this.x = v1.x + (v2.x - v1.x) * alpha
    this.y = v1.y + (v2.y - v1.y) * alpha

    return this
  }

  equals(v) {
    return v.x === this.x && v.y === this.y
  }

  fromArray(array, offset = 0) {
    this.x = array[offset]
    this.y = array[offset + 1]

    return this
  }

  toArray(array = [], offset = 0) {
    array[offset] = this.x
    array[offset + 1] = this.y

    return array
  }

  fromBufferAttribute(attribute, index) {
    this.x = attribute.getX(index)
    this.y = attribute.getY(index)

    return this
  }

  rotateAround(center, angle) {
    const c = Math.cos(angle),
      s = Math.sin(angle)

    const x = this.x - center.x
    const y = this.y - center.y

    this.x = x * c - y * s + center.x
    this.y = x * s + y * c + center.y

    return this
  }

  random() {
    this.x = Math.random()
    this.y = Math.random()

    return this
  }

  *[Symbol.iterator]() {
    yield this.x
    yield this.y
  }
}
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    Vector3.prototype.isVector3 = true

    this.x = x
    this.y = y
    this.z = z
  }

  set(x, y, z) {
    if (z === undefined) z = this.z // sprite.scale.set(x,y)

    this.x = x
    this.y = y
    this.z = z

    return this
  }

  setScalar(scalar) {
    this.x = scalar
    this.y = scalar
    this.z = scalar

    return this
  }

  setX(x) {
    this.x = x

    return this
  }

  setY(y) {
    this.y = y

    return this
  }

  setZ(z) {
    this.z = z

    return this
  }

  setComponent(index, value) {
    switch (index) {
      case 0:
        this.x = value
        break
      case 1:
        this.y = value
        break
      case 2:
        this.z = value
        break
      default:
        throw new Error('index is out of range: ' + index)
    }

    return this
  }

  getComponent(index) {
    switch (index) {
      case 0:
        return this.x
      case 1:
        return this.y
      case 2:
        return this.z
      default:
        throw new Error('index is out of range: ' + index)
    }
  }

  clone() {
    return new this.constructor(this.x, this.y, this.z)
  }

  copy(v) {
    this.x = v.x
    this.y = v.y
    this.z = v.z

    return this
  }

  add(v) {
    this.x += v.x
    this.y += v.y
    this.z += v.z

    return this
  }

  addScalar(s) {
    this.x += s
    this.y += s
    this.z += s

    return this
  }

  addVectors(a, b) {
    this.x = a.x + b.x
    this.y = a.y + b.y
    this.z = a.z + b.z

    return this
  }

  addScaledVector(v, s) {
    this.x += v.x * s
    this.y += v.y * s
    this.z += v.z * s

    return this
  }

  sub(v) {
    this.x -= v.x
    this.y -= v.y
    this.z -= v.z

    return this
  }

  subScalar(s) {
    this.x -= s
    this.y -= s
    this.z -= s

    return this
  }

  subVectors(a, b) {
    this.x = a.x - b.x
    this.y = a.y - b.y
    this.z = a.z - b.z

    return this
  }

  multiply(v) {
    this.x *= v.x
    this.y *= v.y
    this.z *= v.z

    return this
  }

  multiplyScalar(scalar) {
    this.x *= scalar
    this.y *= scalar
    this.z *= scalar

    return this
  }

  multiplyVectors(a, b) {
    this.x = a.x * b.x
    this.y = a.y * b.y
    this.z = a.z * b.z

    return this
  }

  applyEuler(euler) {
    return this.applyQuaternion(_quaternion.setFromEuler(euler))
  }

  applyAxisAngle(axis, angle) {
    return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle))
  }

  applyMatrix3(m) {
    const x = this.x,
      y = this.y,
      z = this.z
    const e = m.elements

    this.x = e[0] * x + e[3] * y + e[6] * z
    this.y = e[1] * x + e[4] * y + e[7] * z
    this.z = e[2] * x + e[5] * y + e[8] * z

    return this
  }

  applyNormalMatrix(m) {
    return this.applyMatrix3(m).normalize()
  }

  applyMatrix4(m) {
    const x = this.x,
      y = this.y,
      z = this.z
    const e = m.elements

    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15])

    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w

    return this
  }

  applyQuaternion(q) {
    const x = this.x,
      y = this.y,
      z = this.z
    const qx = q.x,
      qy = q.y,
      qz = q.z,
      qw = q.w

    // calculate quat * vector

    const ix = qw * x + qy * z - qz * y
    const iy = qw * y + qz * x - qx * z
    const iz = qw * z + qx * y - qy * x
    const iw = -qx * x - qy * y - qz * z

    // calculate result * inverse quat

    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx

    return this
  }

  project(camera) {
    return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix)
  }

  unproject(camera) {
    return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld)
  }

  transformDirection(m) {
    // input: THREE.Matrix4 affine matrix
    // vector interpreted as a direction

    const x = this.x,
      y = this.y,
      z = this.z
    const e = m.elements

    this.x = e[0] * x + e[4] * y + e[8] * z
    this.y = e[1] * x + e[5] * y + e[9] * z
    this.z = e[2] * x + e[6] * y + e[10] * z

    return this.normalize()
  }

  divide(v) {
    this.x /= v.x
    this.y /= v.y
    this.z /= v.z

    return this
  }

  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar)
  }

  min(v) {
    this.x = Math.min(this.x, v.x)
    this.y = Math.min(this.y, v.y)
    this.z = Math.min(this.z, v.z)

    return this
  }

  max(v) {
    this.x = Math.max(this.x, v.x)
    this.y = Math.max(this.y, v.y)
    this.z = Math.max(this.z, v.z)

    return this
  }

  clamp(min, max) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x))
    this.y = Math.max(min.y, Math.min(max.y, this.y))
    this.z = Math.max(min.z, Math.min(max.z, this.z))

    return this
  }

  clampScalar(minVal, maxVal) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x))
    this.y = Math.max(minVal, Math.min(maxVal, this.y))
    this.z = Math.max(minVal, Math.min(maxVal, this.z))

    return this
  }

  clampLength(min, max) {
    const length = this.length()

    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)))
  }

  floor() {
    this.x = Math.floor(this.x)
    this.y = Math.floor(this.y)
    this.z = Math.floor(this.z)

    return this
  }

  ceil() {
    this.x = Math.ceil(this.x)
    this.y = Math.ceil(this.y)
    this.z = Math.ceil(this.z)

    return this
  }

  round() {
    this.x = Math.round(this.x)
    this.y = Math.round(this.y)
    this.z = Math.round(this.z)

    return this
  }

  roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x)
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y)
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z)

    return this
  }

  negate() {
    this.x = -this.x
    this.y = -this.y
    this.z = -this.z

    return this
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z
  }

  // TODO lengthSquared?

  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
  }

  normalize() {
    return this.divideScalar(this.length() || 1)
  }

  setLength(length) {
    return this.normalize().multiplyScalar(length)
  }

  lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha
    this.y += (v.y - this.y) * alpha
    this.z += (v.z - this.z) * alpha

    return this
  }

  lerpVectors(v1, v2, alpha) {
    this.x = v1.x + (v2.x - v1.x) * alpha
    this.y = v1.y + (v2.y - v1.y) * alpha
    this.z = v1.z + (v2.z - v1.z) * alpha

    return this
  }

  cross(v) {
    return this.crossVectors(this, v)
  }

  crossVectors(a, b) {
    const ax = a.x,
      ay = a.y,
      az = a.z
    const bx = b.x,
      by = b.y,
      bz = b.z

    this.x = ay * bz - az * by
    this.y = az * bx - ax * bz
    this.z = ax * by - ay * bx

    return this
  }

  projectOnVector(v) {
    const denominator = v.lengthSq()

    if (denominator === 0) return this.set(0, 0, 0)

    const scalar = v.dot(this) / denominator

    return this.copy(v).multiplyScalar(scalar)
  }

  projectOnPlane(planeNormal) {
    _vector.copy(this).projectOnVector(planeNormal)

    return this.sub(_vector)
  }

  reflect(normal) {
    // reflect incident vector off plane orthogonal to normal
    // normal is assumed to have unit length

    return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)))
  }

  angleTo(v) {
    const denominator = Math.sqrt(this.lengthSq() * v.lengthSq())

    if (denominator === 0) return Math.PI / 2

    const theta = this.dot(v) / denominator

    // clamp, to handle numerical problems

    return Math.acos(MathUtils.clamp(theta, -1, 1))
  }

  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v))
  }

  distanceToSquared(v) {
    const dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z

    return dx * dx + dy * dy + dz * dz
  }

  manhattanDistanceTo(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z)
  }

  setFromSpherical(s) {
    return this.setFromSphericalCoords(s.radius, s.phi, s.theta)
  }

  setFromSphericalCoords(radius, phi, theta) {
    const sinPhiRadius = Math.sin(phi) * radius

    this.x = sinPhiRadius * Math.sin(theta)
    this.y = Math.cos(phi) * radius
    this.z = sinPhiRadius * Math.cos(theta)

    return this
  }

  setFromCylindrical(c) {
    return this.setFromCylindricalCoords(c.radius, c.theta, c.y)
  }

  setFromCylindricalCoords(radius, theta, y) {
    this.x = radius * Math.sin(theta)
    this.y = y
    this.z = radius * Math.cos(theta)

    return this
  }

  setFromMatrixPosition(m) {
    const e = m.elements

    this.x = e[12]
    this.y = e[13]
    this.z = e[14]

    return this
  }

  setFromMatrixScale(m) {
    const sx = this.setFromMatrixColumn(m, 0).length()
    const sy = this.setFromMatrixColumn(m, 1).length()
    const sz = this.setFromMatrixColumn(m, 2).length()

    this.x = sx
    this.y = sy
    this.z = sz

    return this
  }

  setFromMatrixColumn(m, index) {
    return this.fromArray(m.elements, index * 4)
  }

  setFromMatrix3Column(m, index) {
    return this.fromArray(m.elements, index * 3)
  }

  setFromEuler(e) {
    this.x = e._x
    this.y = e._y
    this.z = e._z

    return this
  }

  equals(v) {
    return v.x === this.x && v.y === this.y && v.z === this.z
  }

  fromArray(array, offset = 0) {
    this.x = array[offset]
    this.y = array[offset + 1]
    this.z = array[offset + 2]

    return this
  }

  toArray(array = [], offset = 0) {
    array[offset] = this.x
    array[offset + 1] = this.y
    array[offset + 2] = this.z

    return array
  }

  fromBufferAttribute(attribute, index) {
    this.x = attribute.getX(index)
    this.y = attribute.getY(index)
    this.z = attribute.getZ(index)

    return this
  }

  random() {
    this.x = Math.random()
    this.y = Math.random()
    this.z = Math.random()

    return this
  }

  randomDirection() {
    // Derived from https://mathworld.wolfram.com/SpherePointPicking.html

    const u = (Math.random() - 0.5) * 2
    const t = Math.random() * Math.PI * 2
    const f = Math.sqrt(1 - u ** 2)

    this.x = f * Math.cos(t)
    this.y = f * Math.sin(t)
    this.z = u

    return this
  }

  *[Symbol.iterator]() {
    yield this.x
    yield this.y
    yield this.z
  }
}

const _vector = /*@__PURE__*/ new Vector3()
const _quaternion = /*@__PURE__*/ new Quaternion()

export { Vector3 }
export { Vector2 }

class Spherical {
  constructor(radius = 1, phi = 0, theta = 0) {
    this.radius = radius
    this.phi = phi // polar angle
    this.theta = theta // azimuthal angle

    return this
  }

  set(radius, phi, theta) {
    this.radius = radius
    this.phi = phi
    this.theta = theta

    return this
  }

  copy(other) {
    this.radius = other.radius
    this.phi = other.phi
    this.theta = other.theta

    return this
  }

  // restrict phi to be between EPS and PI-EPS
  makeSafe() {
    const EPS = 0.000001
    this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi))

    return this
  }

  setFromVector3(v) {
    return this.setFromCartesianCoords(v.x, v.y, v.z)
  }

  setFromCartesianCoords(x, y, z) {
    this.radius = Math.sqrt(x * x + y * y + z * z)

    if (this.radius === 0) {
      this.theta = 0
      this.phi = 0
    } else {
      this.theta = Math.atan2(x, z)
      this.phi = Math.acos(MathUtils.clamp(y / this.radius, -1, 1))
    }

    return this
  }

  clone() {
    return new this.constructor().copy(this)
  }
}

export { Spherical }
