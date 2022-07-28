// TODO: keys
export const TOKEN: string = undefined;

export enum WrapperBehaviour {
  prod, // paid requests
  test, // free, unsupported : first 10-transactions only
  mock, // doesn't touch our servers - just returns a response from the EXAMPLES
  error, // helps you simulate local errors like pdf too large, network down etc...
}

export let REQUEST_TYPE: WrapperBehaviour;

// eslint-disable-next-line prefer-const
REQUEST_TYPE = WrapperBehaviour.test;
