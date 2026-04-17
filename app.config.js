import 'dotenv/config';

export default {
  expo: {
    name: 'numbermerger',
    slug: 'numbermerger',
    version: '1.0.0',
    android: {
      package: 'com.numbermerge.puzzle',
    },
    ios: {
      bundleIdentifier: 'com.numbermerge.puzzle',
    },
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: '008936b4-1b10-4fbd-9082-8fb45eb891ef',
      },
    },
    scheme: 'numbermerger',
  },
};
