import { terminalColors } from "./colors";

type Replacer = ((this: any, key: string, value: any) => any) | (string | number)[];
const rx_escapable =
  /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

let gap: string;
let indent: string;
const meta: Record<string, string> = {
  // table of character substitutions
  "\b": "\\b",
  "\t": "\\t",
  "\n": "\\n",
  "\f": "\\f",
  "\r": "\\r",
  '"': '\\"',
  "\\": "\\\\",
};
let rep: Replacer | undefined | null;

export function quote(string: string) {
  // If the string contains no control characters, no quote characters, and no
  // backslash characters, then we can safely slap some quotes around it.
  // Otherwise we must also replace the offending characters with safe escape
  // sequences.

  rx_escapable.lastIndex = 0;
  return rx_escapable.test(string)
    ? '"' +
        string.replace(rx_escapable, function (a) {
          const c = meta[a];
          return typeof c === "string"
            ? c
            : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }) +
        '"'
    : '"' + string + '"';
}
export const defaultColorTransform: ColorTransform = (type, value) => {
  switch (type) {
    case "string":
      return terminalColors.green(value);
    case "number":
      return terminalColors.yellow(value);
    case "null":
      return terminalColors.brightBlack(value);
    case "object":
      return terminalColors.brightBlue(value);
    case "function":
      return terminalColors.magenta(value);
    default:
      return value;
  }
};

function str(
  key: string | number,
  holder: Record<string, any>,
  colorTransform: ColorTransform
): string {
  // Produce a string from holder[key].

  let i; // The loop counter.
  let v; // The member value.
  let length;
  const mind = gap;
  let partial;
  let value = holder[key];

  // If the value has a toJSON method, call it to obtain a replacement value.

  if (value && typeof value === "object" && typeof value.toJSON === "function") {
    value = value.toJSON(key);
  }

  // If we were called with a replacer function, then call the replacer to
  // obtain a replacement value.

  if (typeof rep === "function") {
    value = rep.call(holder, String(key), value);
  }

  // What happens next depends on the value's type.

  let result: string;
  const type = typeof value;
  const nullVal = colorTransform("null", "null");
  switch (type) {
    case "string":
      result = colorTransform(type, quote(value));
      break;
    case "number":
      // JSON numbers must be finite. Encode non-finite numbers as null.

      result = isFinite(value) ? colorTransform(type, String(value)) : nullVal;
      break;

    case "boolean":
      // If the value is a boolean or null, convert it to a string. Note:
      // typeof null does not produce "null". The case is included here in
      // the remote chance that this gets fixed someday.

      result = colorTransform(type, String(value));
      break;

    // If the type is "object", we might be dealing with an object or an array or
    // null.

    case "object":
      // Due to a specification blunder in ECMAScript, typeof null is "object",
      // so watch out for that case.

      if (!value) {
        result = nullVal;
        break;
      }

      // Make an array to hold the partial results of stringifying this object value.

      gap += indent;
      partial = [];

      // Is the value an array?
      if (Object.prototype.toString.apply(value) === "[object Array]") {
        // The value is an array. Stringify every element. Use null as a placeholder
        // for non-JSON values.

        length = value.length;
        for (i = 0; i < length; i += 1) {
          partial[i] = str(i.toString(), value, colorTransform) || nullVal;
        }

        // Join all of the elements together, separated with commas, and wrap them in
        // brackets.

        v =
          partial.length === 0
            ? "[]"
            : gap
              ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
              : "[" + partial.join(",") + "]";
        gap = mind;
        result = v;
        break;
      }

      // If the replacer is an array, use it to select the members to be stringified.
      if (rep && typeof rep === "object") {
        length = rep.length;
        for (i = 0; i < length; i += 1) {
          if (typeof rep[i] === "string") {
            const k = rep[i];
            v = str(k, value, colorTransform);
            if (v) {
              partial.push(colorTransform("object", quote(String(k))) + (gap ? ": " : ":") + v);
            }
          }
        }
      } else {
        // Otherwise, iterate through all of the keys in the object.

        for (const k in value) {
          if (Object.prototype.hasOwnProperty.call(value, k)) {
            v = str(k, value, colorTransform);
            if (v) {
              partial.push(colorTransform("object", quote(k)) + (gap ? ": " : ":") + v);
            }
          }
        }
      }

      // Join all of the member texts together, separated with commas,
      // and wrap them in braces.

      v =
        partial.length === 0
          ? "{}"
          : gap
            ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
            : "{" + partial.join(",") + "}";
      gap = mind;
      result = v;
      break;

    case "function":
      result = colorTransform("function", "[Function]");
      break;

    default:
      result = "";
      break;
  }
  return result;
}

export interface ColorTransform {
  (type: "string" | "number" | "null" | "object" | "boolean" | "function", value: string): string;
}

// If the JSON object does not yet have a stringify method, give it one.
export function stringify(
  value: any,
  replacer?: Replacer | null,
  space?: string | number,
  colorTransform = defaultColorTransform
): string {
  // The stringify method takes a value and an optional replacer, and an optional
  // space parameter, and returns a JSON text. The replacer can be a function
  // that can replace values, or an array of strings that will select the keys.
  // A default replacer method can be provided. Use of the space parameter can
  // produce text that is more easily readable.

  let i;
  gap = "";
  indent = "";

  // If the space parameter is a number, make an indent string containing that
  // many spaces.

  if (typeof space === "number") {
    for (i = 0; i < space; i += 1) {
      indent += " ";
    }

    // If the space parameter is a string, it will be used as the indent string.
  } else if (typeof space === "string") {
    indent = space;
  }

  // If there is a replacer, it must be a function or an array.
  // Otherwise, throw an error.

  rep = replacer;
  if (
    replacer &&
    typeof replacer !== "function" &&
    (typeof replacer !== "object" || typeof replacer.length !== "number")
  ) {
    throw new Error("JSON.stringify");
  }

  // Make a fake root object containing our value under the key of "".
  // Return the result of stringifying the value.

  return str("", { "": value }, colorTransform);
}

declare global {
  interface Console {
    stringify(...args: Parameters<typeof stringify>): void;
  }
}

console.stringify = function _stringify(...args) {
  console.log(stringify(...args));
};
