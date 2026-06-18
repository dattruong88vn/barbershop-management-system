"use client";

import { useState, type ReactNode } from "react";
import {
  Check,
  Command,
  Download,
  Info,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

import {
  UI_FEEDBACK_TYPE_WARNING,
  UI_VARIANT_GHOST,
  UI_VARIANT_SECONDARY,
} from "@/constants/common";
import {
  Avatar,
  Badge,
  Banner,
  Breadcrumbs,
  Button,
  Calendar,
  Card,
  Checkbox,
  CodeBlock,
  Collapse,
  CommandMenu,
  ContextMenu,
  Description,
  Drawer,
  EmptyState,
  Error,
  Feedback,
  Gauge,
  GeistToast,
  Grid,
  Input,
  KeyboardInput,
  KeyValueRow,
  Label,
  LoadingDots,
  MiddleTruncate,
  Modal,
  MultiSelect,
  Note,
  Pagination,
  Phone,
  Pill,
  Popover,
  Progress,
  Radio,
  RelativeTimeCard,
  Select,
  Sheet,
  Skeleton,
  Slider,
  Snippet,
  Spinner,
  SplitButton,
  StatusDot,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Text,
  Textarea,
  ThemeSwitcher,
  Toast,
  Tooltip,
  Window,
} from "@/components/global";
import { FormTextField } from "@/components/global/FormTextField";
import { ImageLightbox } from "@/components/global/ImageLightbox";
import { InlineAlert } from "@/components/global/InlineAlert";
import { PasswordField } from "@/components/global/PasswordField";
import { Badge as UiBadge } from "@/components/global/ui/badge";
import { Button as UiButton } from "@/components/global/ui/button";
import { Input as UiInput } from "@/components/global/ui/input";
import { designSystemTexts } from "@/constants/texts";

const texts = designSystemTexts.reference;
const noop = () => {};
const RELATIVE_TIME_SAMPLE_DATE = new Date("2026-06-12T09:00:00.000Z");
const badgeVariants = ["default", "success", "danger", "warning", "info"] as const;
const badgeSizes = ["sm", "md", "lg"] as const;
const buttonVariants = ["primary", "secondary", "ghost", "danger"] as const;
const buttonSizes = ["sm", "md", "lg"] as const;
const feedbackTypes = ["success", "error", "warning", "info"] as const;
const avatarColors = ["gray", "blue", "green", "red", "amber"] as const;
const displaySizes = ["sm", "md", "lg"] as const;
const shadcnButtonVariants = [
  "default",
  "primary",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;
const shadcnButtonSizes = [
  "xs",
  "sm",
  "default",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const;
const shadcnBadgeVariants = [
  "default",
  "secondary",
  "destructive",
  "outline",
] as const;
const componentMapRows = [
  { title: texts.sections.buttons, value: texts.componentMap.button },
  { title: texts.sections.inputs, value: texts.componentMap.formField },
  { title: texts.sections.feedback, value: texts.componentMap.feedback },
  { title: texts.labels.alert, value: texts.componentMap.alert },
  { title: texts.labels.card, value: texts.componentMap.card },
  { title: texts.sections.display, value: texts.componentMap.dataTable },
  { title: texts.labels.emptyState, value: texts.componentMap.emptyState },
  { title: texts.labels.keyValue, value: texts.componentMap.keyValue },
  { title: texts.labels.loading, value: texts.componentMap.loading },
  { title: texts.labels.modal, value: texts.componentMap.modal },
  { title: texts.groups.navigation, value: texts.componentMap.navigation },
] as const;

function ReferenceSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="border-t border-border py-8">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function ReferenceGroup({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="mt-3 rounded-xl border border-border bg-background p-4">
        {children}
      </div>
    </div>
  );
}

function SwatchGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export function DesignSystemReferenceView() {
  const [textValue, setTextValue] = useState(texts.samples.customerName);
  const [passwordValue, setPasswordValue] = useState(texts.samples.password);
  const [multiValue, setMultiValue] = useState(["haircut"]);
  const [currentPage, setCurrentPage] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 text-foreground md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="pb-8">
          <p className="text-sm font-medium text-muted-foreground">
            {texts.labels.default}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
            {texts.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {texts.description}
          </p>
        </header>

        <ReferenceSection title={texts.sections.componentMap}>
          <ReferenceGroup title={texts.groups.navigation}>
            <div className="grid gap-3">
              {componentMapRows.map((row) => (
                <KeyValueRow
                  key={row.title}
                  title={row.title}
                  value={row.value}
                />
              ))}
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.buttons}>
          <ReferenceGroup title={texts.groups.actions}>
            <div className="space-y-4">
              {buttonVariants.map((variant) => (
                <SwatchGrid key={variant}>
                  {buttonSizes.map((size) => (
                    <Button key={`${variant}-${size}`} size={size} variant={variant}>
                      {variant} {size}
                    </Button>
                  ))}
                  <Button icon={<Save className="size-4" />} variant={variant}>
                    {texts.actions.save}
                  </Button>
                  <Button loading variant={variant}>
                    {texts.actions.update}
                  </Button>
                </SwatchGrid>
              ))}
              <SwatchGrid>
                <Button disabled>{texts.labels.primary}</Button>
                <Button icon={<Download className="size-4" />} variant={UI_VARIANT_SECONDARY}>
                  {texts.labels.secondary}
                </Button>
              </SwatchGrid>
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.badges}>
          <ReferenceGroup title={texts.groups.status}>
            <div className="space-y-4">
              {badgeSizes.map((size) => (
                <SwatchGrid key={size}>
                  {badgeVariants.map((variant) => (
                    <Badge key={`${variant}-${size}`} size={size} variant={variant}>
                      {variant}
                    </Badge>
                  ))}
                </SwatchGrid>
              ))}
              <SwatchGrid>
                {badgeVariants.map((variant) => (
                  <Badge key={variant} outline variant={variant}>
                    {variant} {texts.labels.outline}
                  </Badge>
                ))}
              </SwatchGrid>
            </div>
          </ReferenceGroup>
          <ReferenceGroup title={texts.groups.text}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label required>{texts.labels.email}</Label>
                <Description>{texts.samples.description}</Description>
              </div>
              <Text size="sm" color="muted">
                {texts.samples.description}
              </Text>
              <Text variant="code">{texts.samples.snippet}</Text>
              <Text size="lg">{texts.samples.customerName}</Text>
              <Text color="subtle" variant="caption">
                {texts.labels.description}
              </Text>
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.inputs}>
          <ReferenceGroup title={texts.groups.forms}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder={texts.labels.input} value={textValue} onChange={(event) => setTextValue(event.target.value)} />
              <Input error placeholder={texts.labels.error} />
              <Textarea placeholder={texts.labels.textarea} />
              <Select defaultValue="branch-1">
                <option value="branch-1">{texts.labels.branch} 1</option>
                <option value="branch-2">{texts.labels.branch} 2</option>
              </Select>
              <Checkbox id="reference-checkbox" label={texts.labels.checkbox} defaultChecked />
              <Radio id="reference-radio" label={texts.labels.radio} name="reference-radio" defaultChecked />
              <Switch id="reference-switch" label={texts.labels.switch} defaultChecked />
              <Slider id="reference-slider" label={texts.labels.action} defaultValue={60} />
              <MultiSelect
                options={[
                  { label: texts.options.haircut, value: "haircut" },
                  { label: texts.options.wash, value: "wash" },
                  { label: texts.options.massage, value: "massage" },
                ]}
                value={multiValue}
                onChange={setMultiValue}
              />
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.feedback}>
          <ReferenceGroup title={texts.groups.status}>
            <div className="grid gap-4 md:grid-cols-2">
              {feedbackTypes.map((type) => (
                <Feedback
                  key={type}
                  icon={<Info className="size-4" />}
                  message={texts.samples.description}
                  title={type}
                  type={type}
                />
              ))}
              {feedbackTypes.map((type) => (
                <GeistToast
                  key={`toast-${type}`}
                  description={texts.samples.toastDescription}
                  title={`${texts.samples.toastTitle} - ${type}`}
                  type={type}
                />
              ))}
              {feedbackTypes.map((type) => (
                <Banner
                  key={`banner-${type}`}
                  dismissible
                  icon={<Info className="size-4" />}
                  title={type}
                  type={type}
                >
                  {texts.samples.description}
                </Banner>
              ))}
              <Note title={texts.labels.note}>{texts.samples.description}</Note>
              <Note title={texts.labels.warning} type={UI_FEEDBACK_TYPE_WARNING}>
                {texts.samples.description}
              </Note>
              <Error
                action={{ label: texts.actions.retry, onClick: noop }}
                icon={<XCircle className="size-4" />}
                message={texts.samples.error}
                title={texts.labels.error}
              />
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.layout}>
          <ReferenceGroup title={texts.groups.cards}>
            <div className="space-y-4">
              <Grid columns={3}>
                {(["sm", "md", "lg"] as const).map((padding) => (
                  <Card key={padding} padding={padding}>
                    <Text>{texts.labels.default} card {padding}</Text>
                  </Card>
                ))}
              </Grid>
              <Card bordered={false}>
                <Text>{texts.labels.default} card no border</Text>
              </Card>
              <Tabs
                defaultValue="overview"
                tabs={[
                  {
                    icon: <Info className="size-4" />,
                    label: texts.navigation.overview,
                    value: "overview",
                  },
                  {
                    icon: <Settings className="size-4" />,
                    label: texts.navigation.settings,
                    value: "settings",
                  },
                ]}
              >
                <div className="pt-4 text-sm text-muted-foreground">
                  {texts.samples.description}
                </div>
              </Tabs>
              <Collapse defaultOpen title={texts.labels.default} icon={<Plus className="size-4" />}>
                <Text>{texts.samples.description}</Text>
              </Collapse>
              <Breadcrumbs
                items={[
                  { href: "/", label: texts.navigation.home },
                  { href: "/visits", label: texts.navigation.visits },
                  { label: texts.title },
                ]}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={4}
                onPageChange={setCurrentPage}
              />
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.display}>
          <ReferenceGroup title={texts.groups.status}>
            <div className="space-y-5">
              <SwatchGrid>
                {avatarColors.map((color) => (
                  <Avatar key={color} color={color} initials="DS" />
                ))}
                {displaySizes.map((size) => (
                  <Avatar key={size} color="blue" initials={size.toUpperCase()} size={size} />
                ))}
              </SwatchGrid>
              <SwatchGrid>
                {(["online", "offline", "idle", "busy"] as const).map((status) => (
                  <StatusDot key={status} status={status} />
                ))}
              </SwatchGrid>
              <div className="grid gap-4 md:grid-cols-3">
                <Progress value={68} />
                <Gauge value={72} />
                <div className="flex items-center gap-4">
                  {displaySizes.map((size) => (
                    <Spinner key={size} size={size} />
                  ))}
                  {displaySizes.map((size) => (
                    <LoadingDots key={size} size={size} />
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{texts.labels.customerName}</TableCell>
                      <TableCell>{texts.labels.status}</TableCell>
                      <TableCell>{texts.labels.action}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow interactive>
                      <TableCell>{texts.samples.customerName}</TableCell>
                      <TableCell>{texts.labels.active}</TableCell>
                      <TableCell>{texts.actions.select}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.advanced}>
          <ReferenceGroup title={texts.groups.overlays}>
            <SwatchGrid>
              <Button onClick={() => setIsModalOpen(true)}>{texts.actions.openModal}</Button>
              <Button variant={UI_VARIANT_SECONDARY} onClick={() => setIsLeftDrawerOpen(true)}>
                {texts.actions.openDrawerLeft}
              </Button>
              <Button variant={UI_VARIANT_SECONDARY} onClick={() => setIsRightDrawerOpen(true)}>
                {texts.actions.openDrawerRight}
              </Button>
              <Button variant={UI_VARIANT_GHOST} onClick={() => setIsSheetOpen(true)}>
                {texts.actions.openSheet}
              </Button>
              <Button icon={<Command className="size-4" />} onClick={() => setIsCommandOpen(true)}>
                {texts.actions.openCommandMenu}
              </Button>
              <Popover
                trigger={<Button variant={UI_VARIANT_SECONDARY}>{texts.labels.popover}</Button>}
              >
                <Text size="sm">{texts.samples.description}</Text>
              </Popover>
              <Tooltip content={texts.labels.tooltip}>
                <Button variant={UI_VARIANT_GHOST}>{texts.labels.tooltip}</Button>
              </Tooltip>
            </SwatchGrid>
            <div className="mt-4">
              <ContextMenu
                items={[
                  { icon: <Save className="size-4" />, label: texts.actions.save, onClick: noop },
                  { icon: <Trash2 className="size-4" />, label: texts.actions.delete, onClick: noop },
                ]}
              >
                <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  {texts.labels.contextMenu}
                </div>
              </ContextMenu>
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.specialized}>
          <ReferenceGroup title={texts.groups.controls}>
            <div className="grid gap-4 md:grid-cols-2">
              <CodeBlock code={texts.code.variant} />
              <Snippet code={texts.samples.snippet} />
              <Calendar value={new Date(2026, 5, 12)} />
              <div className="space-y-4">
                <ThemeSwitcher />
                <SplitButton
                  primary={{ label: texts.actions.save, onClick: noop }}
                  options={[
                    { label: texts.actions.copy, onClick: noop },
                    { label: texts.actions.delete, onClick: noop },
                  ]}
                />
                <KeyboardInput keys={[texts.keys.command, texts.keys.commandMenu]} />
                <Phone phone={texts.samples.phone} />
                <MiddleTruncate text={texts.samples.longPath} />
                <RelativeTimeCard
                  date={RELATIVE_TIME_SAMPLE_DATE}
                  label={texts.labels.calendar}
                />
                <Pill icon={<Check className="size-4" />} label={texts.labels.active} onRemove={noop} />
                <Window title={texts.labels.window}>
                  <Text size="sm">{texts.samples.description}</Text>
                </Window>
              </div>
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.legacy}>
          <ReferenceGroup title={texts.groups.forms}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormTextField
                id="reference-form-text"
                label={texts.labels.email}
                placeholder={texts.labels.email}
                required
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
              />
              <FormTextField
                error={texts.samples.error}
                id="reference-form-error"
                label={texts.labels.error}
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
              />
              <PasswordField
                autoComplete="current-password"
                hidePasswordLabel={texts.samples.hidePassword}
                label={texts.labels.password}
                name="reference-password"
                placeholder={texts.labels.password}
                showPasswordLabel={texts.samples.showPassword}
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
              />
              <InlineAlert>{texts.samples.error}</InlineAlert>
            </div>
          </ReferenceGroup>
          <ReferenceGroup title={texts.groups.loading}>
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton variant="text" />
              <Skeleton variant="circle" />
              <Skeleton variant="rect" />
              <EmptyState
                icon={User}
                text={texts.samples.description}
                action={<Button>{texts.actions.submit}</Button>}
              />
              <Toast
                toast={{
                  description: texts.samples.toastDescription,
                  message: texts.samples.toastTitle,
                  type: "success",
                }}
                onClose={noop}
              />
              <Button
                variant={UI_VARIANT_SECONDARY}
                onClick={() => setLightboxUrl(texts.samples.image)}
              >
                {texts.actions.openLightbox}
              </Button>
            </div>
          </ReferenceGroup>
        </ReferenceSection>

        <ReferenceSection title={texts.sections.shadcn}>
          <ReferenceGroup title={texts.groups.actions}>
            <div className="space-y-4">
              <SwatchGrid>
                {shadcnButtonVariants.map((variant) => (
                  <UiButton key={variant} variant={variant}>
                    {variant}
                  </UiButton>
                ))}
              </SwatchGrid>
              <SwatchGrid>
                {shadcnButtonSizes.map((size) => (
                  <UiButton key={size} size={size}>
                    {size.startsWith("icon") ? <Plus className="size-4" /> : size}
                  </UiButton>
                ))}
              </SwatchGrid>
              <SwatchGrid>
                {shadcnBadgeVariants.map((variant) => (
                  <UiBadge key={variant} variant={variant}>
                    {variant}
                  </UiBadge>
                ))}
              </SwatchGrid>
              <UiInput placeholder={texts.labels.search} />
            </div>
          </ReferenceGroup>
        </ReferenceSection>
      </div>

      <Modal
        actions={[
          { label: texts.actions.save, onClick: noop },
          { label: texts.actions.delete, onClick: noop, variant: "danger" },
        ]}
        description={texts.samples.description}
        open={isModalOpen}
        title={texts.labels.modal}
        onOpenChange={setIsModalOpen}
      >
        <Text>{texts.samples.description}</Text>
      </Modal>
      <Drawer
        open={isLeftDrawerOpen}
        side="left"
        title={texts.labels.drawerLeft}
        onOpenChange={setIsLeftDrawerOpen}
      >
        <Text>{texts.samples.description}</Text>
      </Drawer>
      <Drawer
        open={isRightDrawerOpen}
        side="right"
        title={texts.labels.drawerRight}
        onOpenChange={setIsRightDrawerOpen}
      >
        <Text>{texts.samples.description}</Text>
      </Drawer>
      <Sheet
        open={isSheetOpen}
        title={texts.labels.sheet}
        onOpenChange={setIsSheetOpen}
      >
        <Text>{texts.samples.description}</Text>
      </Sheet>
      <CommandMenu
        commands={[
          { icon: <Search className="size-4" />, id: "search", label: texts.labels.search, onSelect: noop },
          { icon: <Settings className="size-4" />, id: "settings", label: texts.labels.action, onSelect: noop },
        ]}
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
      />
      <ImageLightbox
        alt={texts.actions.openLightbox}
        closeLabel={texts.actions.close}
        imageUrl={lightboxUrl}
        onClose={() => setLightboxUrl(null)}
      />
    </main>
  );
}
