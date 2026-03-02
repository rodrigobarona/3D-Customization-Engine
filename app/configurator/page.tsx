import { ConfiguratorLayout } from "@/components/configurator/configurator-layout";
import { MOCK_TSHIRT } from "@/data/mock-product";

export const metadata = {
  title: "3D Configurator | Customize Your T-Shirt",
  description: "Design your custom sporty t-shirt with our real-time 3D configurator.",
};

export default function ConfiguratorPage() {
  return <ConfiguratorLayout product={MOCK_TSHIRT} />;
}
