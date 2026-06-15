import type { ServiceResponsibleRoleValue } from "@/constants/common";

type DecimalLike = {
  toString: () => string;
};

type SnapshotService = {
  id: string;
  name: string;
  price: DecimalLike;
  responsibleRole: ServiceResponsibleRoleValue;
};

type SnapshotCombo = {
  id: string;
  name: string;
  price: DecimalLike;
  comboServices: Array<{
    service: SnapshotService;
  }>;
};

export type VisitServiceSnapshotCreateInput = {
  allocatedPrice: number;
  comboId?: string;
  comboNameSnapshot?: string;
  comboPriceSnapshot?: number;
  price: number;
  responsibleRoleSnapshot: ServiceResponsibleRoleValue;
  serviceId: string;
  serviceNameSnapshot: string;
  servicePriceSnapshot: number;
  shopId: string;
};

type BuildVisitServiceSnapshotsInput = {
  combos: SnapshotCombo[];
  services: SnapshotService[];
  shopId: string;
};

function getDecimalNumber(value: DecimalLike) {
  return Number(value.toString());
}

function getComboServiceAllocations(combo: SnapshotCombo) {
  const comboPrice = getDecimalNumber(combo.price);
  const services = combo.comboServices.map(({ service }) => service);
  const totalServicePrice = services.reduce(
    (total, service) => total + getDecimalNumber(service.price),
    0,
  );

  if (!services.length || totalServicePrice <= 0) {
    return [];
  }

  const allocationRatio = comboPrice / totalServicePrice;
  let allocatedTotal = 0;

  return services.map((service, index) => {
    const isLastService = index === services.length - 1;
    const allocatedPrice = isLastService
      ? comboPrice - allocatedTotal
      : Math.round(getDecimalNumber(service.price) * allocationRatio);

    allocatedTotal += allocatedPrice;

    return {
      allocatedPrice,
      service,
    };
  });
}

export function buildVisitServiceSnapshots({
  combos,
  services,
  shopId,
}: BuildVisitServiceSnapshotsInput) {
  const serviceSnapshots: VisitServiceSnapshotCreateInput[] = services.map(
    (service) => {
      const servicePrice = getDecimalNumber(service.price);

      return {
        allocatedPrice: servicePrice,
        price: servicePrice,
        responsibleRoleSnapshot: service.responsibleRole,
        serviceId: service.id,
        serviceNameSnapshot: service.name,
        servicePriceSnapshot: servicePrice,
        shopId,
      };
    },
  );

  const comboSnapshots: VisitServiceSnapshotCreateInput[] = combos.flatMap(
    (combo) => {
      const comboPrice = getDecimalNumber(combo.price);

      return getComboServiceAllocations(combo).map(
        ({ allocatedPrice, service }) => ({
          allocatedPrice,
          comboId: combo.id,
          comboNameSnapshot: combo.name,
          comboPriceSnapshot: comboPrice,
          price: allocatedPrice,
          responsibleRoleSnapshot: service.responsibleRole,
          serviceId: service.id,
          serviceNameSnapshot: service.name,
          servicePriceSnapshot: getDecimalNumber(service.price),
          shopId,
        }),
      );
    },
  );

  return {
    totalPrice: [
      ...services.map((service) => getDecimalNumber(service.price)),
      ...combos.map((combo) => getDecimalNumber(combo.price)),
    ].reduce((total, price) => total + price, 0),
    visitServices: [...serviceSnapshots, ...comboSnapshots],
  };
}
