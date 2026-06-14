import { Tree, formatFiles, generateFiles, joinPathFragments, readJson } from '@nx/devkit';
import { Schema } from './schema';
import { pascal } from 'case';

interface StoryblokComponentSchema {
  name: string;
  schema: Record<string, any>;
}

interface ComponentSchemas {
  [componentName: string]: StoryblokComponentSchema;
}

function getControlForField(type: string, schema: any): any {
  const options = schema.options?.map((o: any) => o.value) ?? [];
  const optionLength = options.length;

  switch (type) {
    case 'text':
    case 'textarea':
    case 'markdown':
      return { control: 'text' };
    case 'richtext':
    case 'link':
    case 'table':
    case 'asset':
    case 'references':
      return { control: 'object' };
    case 'boolean':
      return { control: 'boolean' };
    case 'number':
      return { control: 'number' };
    case 'option':
      return {
        control: {
          type: optionLength > 5 ? 'select' : 'radio',
          options,
        },
      };
    case 'options':
      return {
        control: {
          type: optionLength > 5 ? 'multi-select' : 'check',
          options,
        },
      };
    case 'datetime':
    case 'date/time':
      return { control: 'date' };
    case 'file':
      return { control: { type: 'file' } };
    case 'image':
      return { control: { type: 'file', accept: 'image/*' } };
    case 'plugin':
      return { control: 'text' };
    case 'custom': {
      // custom color palette control
      const fieldType = schema.field_type;
      if (fieldType === 'storyblok-palette') {
        return transformStoryblokPalette(schema.options);
      }
      return { control: 'object' };
    }
    default:
      return null;
  }
}

function transformStoryblokPalette(pluginOptions: any[] = []): any {
  let defaultValue = '#000';
  let presetColors: string[] = [];

  for (const opt of pluginOptions) {
    if (opt.name === 'defaultValue') {
      defaultValue = opt.value;
    }
    if (opt.name === 'colors') {
      try {
        presetColors = JSON.parse(opt.value);
      } catch (e) {
        throw new Error(`Cannot generate palette`);
      }
    }
  }

  return {
    control: {
      type: 'color',
      presetColors,
      defaultValue,
    },
  };
}

function generateArgsAndArgTypes(
  input: any,
  schema: Record<string, any>,
  allSchemas: ComponentSchemas
): { args: any; argTypes: any } {
  const args: any = {};
  const argTypes: any = {};

  for (const key of Object.keys(schema)) {
    const field = schema[key];
    let fieldValue = input?.[key];
    const fieldType = field.type;

    if (fieldType === 'group') {
      const children = field.fields || {};
      const childResult = generateArgsAndArgTypes(fieldValue ?? {}, children, allSchemas);
      Object.assign(args, childResult.args);
      Object.assign(argTypes, childResult.argTypes);
      continue;
    }

    if (fieldType === 'bloks' && Array.isArray(fieldValue)) {
      args[key] = [];
      argTypes[key] = [];

      for (const item of fieldValue) {
        const componentName = item.component;
        const compSchema = allSchemas[componentName]?.schema;

        if (!compSchema) {
          args[key].push(item);
          argTypes[key].push({});
          continue;
        }

        const { args: subArgs, argTypes: subArgTypes } = generateArgsAndArgTypes(item, compSchema, allSchemas);
        args[key].push(subArgs);
        argTypes[key].push(subArgTypes);
      }
      continue;
    }
    if (fieldType === 'custom' && field.field_type === 'storyblok-palette') {
      if (fieldValue && fieldValue?.value) {
        fieldValue = {
          value: fieldValue.value,
        };
      }
      const defValOpt = field.options.find((o: any) => o.name === 'defaultValue');

      if (defValOpt) {
        fieldValue = fieldValue ?? {
          value: defValOpt.value,
        };
      }
    }

    args[key] = fieldValue;
    const control = getControlForField(fieldType, field);
    argTypes[key] = {
      name: key,
      description: field.description ?? '',
      ...control,
    };
  }

  return { args, argTypes };
}

function buildSchemaMap(components: StoryblokComponentSchema[]): ComponentSchemas {
  const map: ComponentSchemas = {};
  for (const comp of components) {
    map[comp.name] = comp;
  }
  return map;
}

export default async function generateStructuredArgs(tree: Tree, schema: Schema) {
  const componentData = JSON.parse(schema.blokJson);
  const schemaPath = 'libs/shared/types/components.sb-sg.json';
  const componentSchemas = readJson(tree, schemaPath);

  const allSchemas = buildSchemaMap(componentSchemas.components);
  const rootComponentName = componentData.component;
  const rootSchema = allSchemas[rootComponentName]?.schema;

  if (!rootSchema) throw new Error(`Cannot find schema for component: ${rootComponentName}`);

  const { args, argTypes } = generateArgsAndArgTypes(componentData, rootSchema, allSchemas);

  const outputDir = `${schema.relativePath}`;
  const fileName = `${schema.componentName}.args.ts`;
  const originalName = schema.componentName;
  const componentName = pascal(schema.componentName);
  generateFiles(tree, joinPathFragments(__dirname, 'files'), outputDir, {
    argsJson: JSON.stringify(args, null, 2),
    argTypesJson: JSON.stringify(argTypes, null, 2),
    componentName,
    originalName,
  });

  await formatFiles(tree);

  console.log(`✅ Generated ${fileName} under ${outputDir}`);
}
