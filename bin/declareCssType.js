/**
 * TypeScript Type Declaration Generator for Bernova
 *
 * Generates comprehensive TypeScript type definitions for CSS properties,
 * pseudo-classes, pseudo-elements, advanced selectors, and additional CSS features.
 *
 * This script creates type-safe interfaces that enable:
 * - IntelliSense support for CSS properties
 * - Type checking for pseudo-classes and pseudo-elements
 * - Advanced selector typing
 * - Media query type definitions
 * - Attribute selector typing
 *
 * The generated types ensure compile-time safety when using Bernova's CSS-in-JS system.
 */

const path = require('path');
const {
  cssProps,
  cssPseudoClasses,
  cssPseudoElements,
  cssAdvancedSelectors,
} = require('../src/constants/index.js');
const { writeDoc } = require('../src/lib/writeDoc/writeDoc.utils.js');

/**
 * Generates and writes TypeScript type definitions for the Bernova CSS system
 * Creates a comprehensive type system that covers all CSS features supported by Bernova
 *
 * @returns {Promise<void>} Resolves when type definitions have been written to file
 */
const declareCssType = async () => {
  // Base utility types for Bernova's special features

  /** Type for style inheritance - allows extending styles from other components */
  const libExtendsInterface = `type LibExtendsType = {\n $extends?: string; \n};\n`;

  /** Type for style recycling - allows reusing previously defined styles */
  const libRecycleInterface = `type LibRecycleType = {\n $recycle?: string; \n};\n`;

  /** Type for foreign theme integration - allows importing styles from external themes */
  const foreignInterface = `type ForeignType = {\n $foreign?: { [key: string]: { [key: string]: CssPropsType & CssPseudoJoinedType & CssAddicionalTypes } }; \n};\n`;
  /** Main CSS properties type - includes all standard CSS properties plus Bernova utilities */
  const cssPropsInterface = `type CssPropsType = LibExtendsType & LibRecycleType & ForeignType & {\n${Object.keys(
    cssProps
  )
    .map((prop) => `${prop}?: string;`)
    .join('\n')}\n}\n`;

  /** Advanced CSS selectors type - for complex targeting like sibling, child selectors etc. */
  const cssAdvancedSelectorsInterface = `type CssAdvancedSelectorsType = {\n${Object.keys(
    cssAdvancedSelectors
  )
    .map((selector) => `${selector}?: CssPropsType & { $target: string }`)
    .join('\n')}\n}\n`;

  /** Combined pseudo-classes and pseudo-elements type */
  const cssPseudoJoined = `type CssPseudoJoinedType = { $pseudoClasses?: CssPseudoClassesType;\n$pseudoElements?: CssPseudoElementsType;\n}\n`;

  /** Additional CSS features type - includes advanced selectors and media queries */
  const cssAddicionalTypes = `type CssAddicionalTypes = {\n$advancedSelectors?: CssAdvancedSelectorsType[];\n $mediaQueries?: MediaQueriesType;\n}\n`;
  // cssPseudoClassesInterface
  const cssPseudoClassesInterface = `type CssPseudoClassesType = {\n${Object.keys(
    cssPseudoClasses
  )
    .map(
      (pseudoClass) =>
        `${pseudoClass}?: CssPropsType & { $target?: string } & CssAddicionalTypes & { $attributes?: CssAttributesType } | CssPseudoElementsType & CssAddicionalTypes & { $attributes?: CssAttributesType } | CssPseudoClassesType & CssAddicionalTypes & { $attributes?: CssAttributesType };`
    )
    .join('\n')}\n}\n`;
  // cssPseudoElementsInterface
  const cssPseudoElementsInterface = `type CssPseudoElementsType = {\n${Object.keys(
    cssPseudoElements
  )
    .map(
      (pseudoElement) =>
        `${pseudoElement}?: CssPropsType & CssAddicionalTypes & { $attributes?: CssAttributesType } | CssPseudoElementsType & CssAddicionalTypes & { $attributes?: CssAttributesType } | CssPseudoClassesType & CssAddicionalTypes & { $attributes?: CssAttributesType };`
    )
    .join('\n')}\n}\n`;
  // attributesInterface
  const attributesInterface = `type CssAttributesType = {\n [key: string]: CssPropsType & CssAddicionalTypes & CssPseudoJoinedType | {\n [key: string]: CssPropsType & CssAddicionalTypes & CssPseudoJoinedType \n};\n}\n`;
  // mediaQueriesInterface
  // let mediaQueriesInterface = '';
  // if (!!mediaQueries && Object.keys(mediaQueries).length) {
  //   if (!!mediaQueries.screen && Object.keys(mediaQueries.screen).length) {
  //     const mediaScreenInterface = `type MediaScreenType = {\n${Object.keys(
  //       mediaQueries.screen
  //     )
  //       .map((size) => `${size}?: CssPropsType;`)
  //       .join('\n')}\n}\n`;
  //     mediaQueriesInterface +=
  //       mediaScreenInterface +
  //       `type MediaQueriesType = {\n screen?: MediaScreenType;\n}\n`;
  //   }
  // }

  const cssGeneratorInterface = `export type CssGeneratorType = CssPropsType & {\n$pseudoClasses?: CssPseudoClassesType;\n$pseudoElements?: CssPseudoElementsType;\n$mediaQueries?: MediaQueriesType;\n$attributes?: CssAttributesType;\n$advancedSelectors?: CssAdvancedSelectorsType[];\n}\n`;
  const finalTypeDoc =
    libExtendsInterface +
    libRecycleInterface +
    foreignInterface +
    cssPropsInterface +
    cssAdvancedSelectorsInterface +
    cssPseudoJoined +
    cssAddicionalTypes +
    cssPseudoClassesInterface +
    cssPseudoElementsInterface +
    // mediaQueriesInterface +
    attributesInterface +
    cssGeneratorInterface;

  // Write the complete type definitions to the types directory
  const outputPath = path.resolve(__dirname, '../types/generatorType.ts');
  await writeDoc(outputPath, finalTypeDoc, 'TypeScript declarations');

  console.log('✅ TypeScript type definitions generated successfully');
  console.log(`📝 Types written to: ${outputPath}`);
};

// Execute type declaration generation
declareCssType().catch((error) => {
  console.error(
    '❌ Failed to generate TypeScript declarations:',
    error.message
  );
  process.exit(1);
});
