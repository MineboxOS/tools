package io.minebox.nbd.ep;

import java.io.IOException;
import java.nio.ByteBuffer;

import com.codahale.metrics.MetricRegistry;
import io.dropwizard.util.Size;
import io.minebox.config.MinebdConfig;
import io.minebox.nbd.NullEncryption;
import io.minebox.nbd.SerialNumberService;
import io.minebox.nbd.StaticEncyptionKeyProvider;
import io.minebox.nbd.TestUtil;
import org.junit.Assert;
import org.junit.Test;

import static org.junit.Assert.fail;

/**
 * Created by andreas on 20.02.17.
 */
public class BucketTest {


    private void assertExeption(Runnable r) {
        try {
            r.run();
            fail();
        } catch (UnsupportedOperationException e) {
            //success
        }
    }

    @Test
    public void testExport() throws IOException {
        final MinebdConfig cfg = TestUtil.createSampleConfig();
        final BucketFactory bucketFactory = new BucketFactory(new SerialNumberService(new StaticEncyptionKeyProvider("testJunit")), cfg, new NullEncryption(), TestDownloadService::new);
        final MineboxExport export = new MineboxExport(cfg, new MetricRegistry(), bucketFactory);
        export.open("test");
        export.write(0, ByteBuffer.wrap(new byte[]{1, 2, 3}), true);
        export.read(0, 100);
        export.trim(0, (int) cfg.bucketSize.toBytes());
    }

    @Test
    public void checkPositiveBounds() throws IOException {
        MinebdConfig cfg = TestUtil.createSampleConfig();
        cfg.bucketSize = Size.megabytes(40);
        long bucketSize = cfg.bucketSize.toBytes();
        final BucketFactory bucketFactory = new BucketFactory(new SerialNumberService(new StaticEncyptionKeyProvider("testJunit")), cfg, new NullEncryption(), TestDownloadService::new);

        final Raid1Buckets underTest = (Raid1Buckets) bucketFactory.create(0);


        Assert.assertEquals(bucketSize, underTest.calcLengthInThisBucket(0, bucketSize));

        Assert.assertEquals(bucketSize, underTest.calcLengthInThisBucket(0, bucketSize + 1));


        Assert.assertEquals(bucketSize - 50, underTest.calcLengthInThisBucket(50, bucketSize + 1));

        Assert.assertEquals(1, underTest.calcLengthInThisBucket(bucketSize - 1, 1));

        assertExeption(() -> underTest.calcLengthInThisBucket(bucketSize, 0));

        assertExeption(() -> underTest.calcLengthInThisBucket(-1, 1));

    }

}