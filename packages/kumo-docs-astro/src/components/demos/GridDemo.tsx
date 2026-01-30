import { Grid, GridItem, Surface, Text } from "@cloudflare/kumo";

export function GridDemo() {
  return (
    <Grid variant="2up" gap="base">
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 1</Text>
          <div className="mt-1">
            <Text variant="secondary">First grid item</Text>
          </div>
        </Surface>
      </GridItem>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 2</Text>
          <div className="mt-1">
            <Text variant="secondary">Second grid item</Text>
          </div>
        </Surface>
      </GridItem>
    </Grid>
  );
}

export function GridVariantsDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-kumo-subtle">variant="2up"</p>
        <Grid variant="2up" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">variant="3up"</p>
        <Grid variant="3up" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>3</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">variant="4up"</p>
        <Grid variant="4up" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>3</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>4</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
}

export function GridAsymmetricDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-kumo-subtle">variant="2-1" (66% / 33%)</p>
        <Grid variant="2-1" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4">
              <Text bold>Main Content</Text>
              <div className="mt-1">
                <Text variant="secondary">Two-thirds width</Text>
              </div>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4">
              <Text bold>Sidebar</Text>
              <div className="mt-1">
                <Text variant="secondary">One-third width</Text>
              </div>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">variant="1-2" (33% / 66%)</p>
        <Grid variant="1-2" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4">
              <Text bold>Sidebar</Text>
              <div className="mt-1">
                <Text variant="secondary">One-third width</Text>
              </div>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4">
              <Text bold>Main Content</Text>
              <div className="mt-1">
                <Text variant="secondary">Two-thirds width</Text>
              </div>
            </Surface>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
}

export function GridGapDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-kumo-subtle">gap="none"</p>
        <Grid variant="side-by-side" gap="none">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">gap="sm"</p>
        <Grid variant="side-by-side" gap="sm">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">
          gap="base" (default, responsive)
        </p>
        <Grid variant="side-by-side" gap="base">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>

      <div>
        <p className="mb-2 text-kumo-subtle">gap="lg"</p>
        <Grid variant="side-by-side" gap="lg">
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>1</Text>
            </Surface>
          </GridItem>
          <GridItem>
            <Surface className="rounded-lg p-4 text-center">
              <Text>2</Text>
            </Surface>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
}

export function GridMobileDividerDemo() {
  return (
    <Grid variant="4up" gap="base" mobileDivider>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 1</Text>
          <div className="mt-1">
            <Text variant="secondary">Has divider on mobile</Text>
          </div>
        </Surface>
      </GridItem>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 2</Text>
          <div className="mt-1">
            <Text variant="secondary">Has divider on mobile</Text>
          </div>
        </Surface>
      </GridItem>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 3</Text>
          <div className="mt-1">
            <Text variant="secondary">Has divider on mobile</Text>
          </div>
        </Surface>
      </GridItem>
      <GridItem>
        <Surface className="rounded-lg p-4">
          <Text bold>Item 4</Text>
          <div className="mt-1">
            <Text variant="secondary">Has divider on mobile</Text>
          </div>
        </Surface>
      </GridItem>
    </Grid>
  );
}
