---
name: "🐛 Bug report"
about: Issue with component rendering in React Styleguidist
---

# XYZ ABC 123

**Current behavior**

When using React Styleguidist with components that have complex prop types (especially those using TypeScript interfaces with nested objects), the props table in the documentation doesn't render correctly. The nested properties are either missing entirely or displayed without proper indentation, making it difficult to understand the component's API.

Additionally, when the component has more than 10 props, the table becomes difficult to read as there's no pagination or grouping of related props.

**To reproduce**

1. Fork the example project repository: https://github.com/styleguidist/example
2. Create a new component with complex nested TypeScript interfaces as props
3. Add the following component code:

```tsx
interface NestedConfig {
  enabled: boolean;
  options: {
    delay: number;
    retries: number;
    timeout: number;
  };
  callbacks: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  };
}

interface ComplexComponentProps {
  title: string;
  description?: string;
  items: string[];
  config: NestedConfig;
  onAction: (itemId: string, action: 'edit' | 'delete' | 'view') => void;
}

/**
 * A component with complex props structure
 */
const ComplexComponent: React.FC<ComplexComponentProps> = ({
  title,
  description,
  items,
  config,
  onAction
}) => {
  // Component implementation
  return (
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <ul>
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default ComplexComponent;
```

4. Add documentation in a Markdown file
5. Run the style guide with `npm run styleguide`
6. Observe that the nested properties in the props table are not properly displayed

**Expected behavior**

The props table should:

1. Properly display nested object properties with appropriate indentation or expandable sections
2. Show the complete type information for complex types
3. Maintain readability even with many props by implementing pagination or grouping
4. Provide visual distinction between required and optional props
5. Allow filtering or searching within the props table for components with many properties

This would make it much easier to understand the component's API, especially for complex components with nested data structures.