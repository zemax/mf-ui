const path         = require( "path" );
const fs           = require( "fs" );
const sass         = require( 'sass' );
const svg_importer = require( 'node-sass-svg/svg-importer' );
const postcss      = require( 'postcss' );
const autoprefixer = require( 'autoprefixer' );

console.log( sass.info );
[
    {
        'inFile':  path.join( __dirname, "src/css/styles.scss" ),
        'outFile': path.join( __dirname, "dist/css/styles.css" )
    }
].forEach(
    ( { inFile, outFile } ) => sass.render(
        {
            file:           inFile,
            outFile:        outFile,
            outputStyle:    'compressed',
            sourceMap:      true,
            sourceMapEmbed: true,
            importer:       [ svg_importer ],
        },
        ( error, result ) => {
            if ( error ) {
                console.log( "*** node-sass error ***", error );
                return;
            }
            
            // Autoprefixer
            
            postcss( [ autoprefixer( { grid: true } ) ] )
                .process( result.css, {
                    from: inFile,
                    to:   outFile,
                    map:  { inline: false },
                } )
                .then( result => {
                    fs.writeFile(
                        outFile,
                        result.css,
                        ( error ) => {
                            if ( error ) {
                                console.log( "*** write error ***", error );
                                return;
                            }
                            
                            console.log( "  ", outFile, fs.statSync( outFile ).size + ' bytes', '[built]' );
                        } );
                    
                    if ( result.map ) {
                        fs.writeFile(
                            outFile + '.map',
                            result.map.toString(),
                            ( error ) => {
                                if ( error ) {
                                    console.log( "*** write error ***", error );
                                    return;
                                }
                                
                                console.log( "  ", outFile + '.map', fs.statSync( outFile + '.map' ).size + ' bytes', '[built]' );
                            } );
                    }
                } );
        } )
);
