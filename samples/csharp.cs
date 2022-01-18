using System.Collections.Generic;
using UnityEngine;

namespace PathCreation.Utility {
    public static class MathUtility {

		float4 frag (v2f i) : SV_Target {
			float2 uv = pointOnSphereToUV(i.pos);
			float2 countryData = text2D(countryData, UV).rg;
			float countryOutLine = countryData[0];
			int countryIndex = (int)countryData[1] - 1;

			float3 colour = countryOutline;

			if (countryIndex >= 0) {
				float lastVisited = CountryLastVisitTime[countryIndex];
				float timeSinceVisit = currentTime - lastVisitTime;
			}

		}

        // Transform point from local to world space
        public static Vector3 TransformPoint (Vector3 p, Transform t, PathSpace space) {
            // path only works correctly for uniform scales, so average out xyz global scale
            float scale = Vector3.Dot (t.lossyScale, Vector3.one) / 3;
            Vector3 constrainedPos = t.position;
            Quaternion constrainedRot = t.rotation;
            ConstrainPosRot (ref constrainedPos, ref constrainedRot, space);
            return constrainedRot * p * scale + constrainedPos;
        }

        // Transform point from world to local space
        public static Vector3 InverseTransformPoint (Vector3 p, Transform t, PathSpace space) {
            Vector3 constrainedPos = t.position;
            Quaternion constrainedRot = t.rotation;
            ConstrainPosRot (ref constrainedPos, ref constrainedRot, space);

            // path only works correctly for uniform scales, so average out xyz global scale
            float scale = Vector3.Dot (t.lossyScale, Vector3.one) / 3;
            var offset = p - constrainedPos;

            return Quaternion.Inverse (constrainedRot) * offset / scale;
        }

        // Transform vector from local to world space (affected by rotation and scale, but not position)
        public static Vector3 TransformVector (Vector3 p, Transform t, PathSpace space) {
            // path only works correctly for uniform scales, so average out xyz global scale
            float scale = Vector3.Dot (t.lossyScale, Vector3.one) / 3;
            Quaternion constrainedRot = t.rotation;
            ConstrainRot (ref constrainedRot, space);
            return constrainedRot * p * scale;
        }

        // Transform vector from world to local space (affected by rotation and scale, but not position)
        public static Vector3 InverseTransformVector (Vector3 p, Transform t, PathSpace space) {
            Quaternion constrainedRot = t.rotation;
            ConstrainRot (ref constrainedRot, space);
            // path only works correctly for uniform scales, so average out xyz global scale
            float scale = Vector3.Dot (t.lossyScale, Vector3.one) / 3;
            return Quaternion.Inverse (constrainedRot) * p / scale;
        }

        // Transform vector from local to world space (affected by rotation, but not position or scale)
        public static Vector3 TransformDirection (Vector3 p, Transform t, PathSpace space) {
            Quaternion constrainedRot = t.rotation;
            ConstrainRot (ref constrainedRot, space);
            return constrainedRot * p;
        }

        // Transform vector from world to local space (affected by rotation, but not position or scale)
        public static Vector3 InverseTransformDirection (Vector3 p, Transform t, PathSpace space) {
            Quaternion constrainedRot = t.rotation;
            ConstrainRot (ref constrainedRot, space);
            return Quaternion.Inverse (constrainedRot) * p;
        }

        public static bool LineSegmentsIntersect (Vector2 a1, Vector2 a2, Vector2 b1, Vector2 b2) {
            float d = (b2.x - b1.x) * (a1.y - a2.y) - (a1.x - a2.x) * (b2.y - b1.y);
            if (d == 0)
                return false;
            float t = ((b1.y - b2.y) * (a1.x - b1.x) + (b2.x - b1.x) * (a1.y - b1.y)) / d;
            float u = ((a1.y - a2.y) * (a1.x - b1.x) + (a2.x - a1.x) * (a1.y - b1.y)) / d;

            return t >= 0 && t <= 1 && u >= 0 && u <= 1;
        }

        public static bool LinesIntersect (Vector2 a1, Vector2 a2, Vector2 a3, Vector2 a4) {
            return (a1.x - a2.x) * (a3.y - a4.y) - (a1.y - a2.y) * (a3.x - a4.x) != 0;
        }

        public static Vector2 PointOfLineLineIntersection (Vector2 a1, Vector2 a2, Vector2 a3, Vector2 a4) {
            float d = (a1.x - a2.x) * (a3.y - a4.y) - (a1.y - a2.y) * (a3.x - a4.x);
            if (d == 0) {
                Debug.LogError ("Lines are parallel, please check that this is not the case before calling line intersection method");
                return Vector2.zero;
            } else {
                float n = (a1.x - a3.x) * (a3.y - a4.y) - (a1.y - a3.y) * (a3.x - a4.x);
                float t = n / d;
                return a1 + (a2 - a1) * t;
            }
        }

        public static Vector2 ClosestPointOnLineSegment (Vector2 p, Vector2 a, Vector2 b) {
            Vector2 aB = b - a;
            Vector2 aP = p - a;
            float sqrLenAB = aB.sqrMagnitude;

            if (sqrLenAB == 0)
                return a;

            float t = Mathf.Clamp01 (Vector2.Dot (aP, aB) / sqrLenAB);
            return a + aB * t;
        }

        public static Vector3 ClosestPointOnLineSegment (Vector3 p, Vector3 a, Vector3 b) {
            Vector3 aB = b - a;
            Vector3 aP = p - a;
            float sqrLenAB = aB.sqrMagnitude;

            if (sqrLenAB == 0)
                return a;

            float t = Mathf.Clamp01 (Vector3.Dot (aP, aB) / sqrLenAB);
            return a + aB * t;
        }

        public static int SideOfLine (Vector2 a, Vector2 b, Vector2 c) {
            return (int) Mathf.Sign ((c.x - a.x) * (-b.y + a.y) + (c.y - a.y) * (b.x - a.x));
        }

        /// returns the smallest angle between ABC. Never greater than 180
        public static float MinAngle (Vector3 a, Vector3 b, Vector3 c) {
            return Vector3.Angle ((a - b), (c - b));
        }

        public static bool PointInTriangle (Vector2 a, Vector2 b, Vector2 c, Vector2 p) {
            float area = 0.5f * (-b.y * c.x + a.y * (-b.x + c.x) + a.x * (b.y - c.y) + b.x * c.y);
            float s = 1 / (2 * area) * (a.y * c.x - a.x * c.y + (c.y - a.y) * p.x + (a.x - c.x) * p.y);
            float t = 1 / (2 * area) * (a.x * b.y - a.y * b.x + (a.y - b.y) * p.x + (b.x - a.x) * p.y);
            return s >= 0 && t >= 0 && (s + t) <= 1;
        }

        public static bool PointsAreClockwise (Vector2[] points) {
            float signedArea = 0;
            for (int i = 0; i < points.Length; i++) {
                int nextIndex = (i + 1) % points.Length;
                signedArea += (points[nextIndex].x - points[i].x) * (points[nextIndex].y + points[i].y);
            }

            return signedArea >= 0;
        }

        static void ConstrainPosRot (ref Vector3 pos, ref Quaternion rot, PathSpace space) {
            if (space == PathSpace.xy) {
                var eulerAngles = rot.eulerAngles;
                if (eulerAngles.x != 0 || eulerAngles.y != 0) {
                    rot = Quaternion.AngleAxis (eulerAngles.z, Vector3.forward);
                }
                pos = new Vector3 (pos.x, pos.y, 0);
            } else if (space == PathSpace.xz) {
                var eulerAngles = rot.eulerAngles;
                if (eulerAngles.x != 0 || eulerAngles.z != 0) {
                    rot = Quaternion.AngleAxis (eulerAngles.y, Vector3.up);
                }
                pos = new Vector3 (pos.x, 0, pos.z);
            }
        }

        static void ConstrainRot (ref Quaternion rot, PathSpace space) {
            if (space == PathSpace.xy) {
                var eulerAngles = rot.eulerAngles;
                if (eulerAngles.x != 0 || eulerAngles.y != 0) {
                    rot = Quaternion.AngleAxis (eulerAngles.z, Vector3.forward);
                }
            } else if (space == PathSpace.xz) {
                var eulerAngles = rot.eulerAngles;
                if (eulerAngles.x != 0 || eulerAngles.z != 0) {
                    rot = Quaternion.AngleAxis (eulerAngles.y, Vector3.up);
                }
            }
        }
    }
}
