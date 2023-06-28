const fs = require('fs')
const rimraf = require('rimraf')

const clear = () => {
  return {
    name: "Clear",
    setup: (build) => {
      build.onStart(() => {
        const { outdir, outfile } = build.initialOptions;
        if (outdir && fs.existsSync(outdir)) {
          rimraf.sync(outdir)
        }
        if (outfile && fs.existsSync(outfile)) {
          rimraf.sync(outfile)
        }
      });
    },
  };
};

module.exports = clear